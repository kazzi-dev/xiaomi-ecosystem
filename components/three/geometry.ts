import * as THREE from 'three';

/** Corner radii: a single value, or [topLeft, topRight, bottomRight, bottomLeft]. */
export type Radii = number | [number, number, number, number];

export function roundedRectShape(w: number, h: number, r: Radii) {
  const max = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = (typeof r === 'number' ? [r, r, r, r] : r).map((v) => Math.min(Math.max(v, 0), max));
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + bl, y);
  s.lineTo(x + w - br, y);
  if (br > 0) s.absarc(x + w - br, y + br, br, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - tr);
  if (tr > 0) s.absarc(x + w - tr, y + h - tr, tr, 0, Math.PI / 2, false);
  s.lineTo(x + tl, y + h);
  if (tl > 0) s.absarc(x + tl, y + h - tl, tl, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + bl);
  if (bl > 0) s.absarc(x + bl, y + bl, bl, Math.PI, Math.PI * 1.5, false);
  return s;
}

const shrink = (r: Radii, by: number): Radii =>
  typeof r === 'number' ? Math.max(r - by, 0.001) : (r.map((v) => Math.max(v - by, 0.001)) as Radii);

/** A device slab: rounded rectangle extruded to depth `d` with soft bevelled edges, centered on the origin. */
export function slabGeometry(w: number, h: number, d: number, r: Radii, quality = 1) {
  const bevel = Math.min(d * 0.4, 0.03);
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w - bevel * 2, h - bevel * 2, shrink(r, bevel)), {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: Math.max(2, Math.round(5 * quality)),
    curveSegments: Math.max(6, Math.round(18 * quality)),
  });
  geo.translate(0, 0, -(d - bevel * 2) / 2);
  geo.computeVertexNormals();
  return geo;
}

/** A flat rounded rectangle with UVs normalised to 0..1, for screens and back glass. */
export function panelGeometry(w: number, h: number, r: Radii, quality = 1) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), Math.max(6, Math.round(18 * quality)));
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  }
  uv.needsUpdate = true;
  return geo;
}
