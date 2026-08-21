/**
 * Geometry of the seamless pipe cutaway.
 *
 * The drawing is a longitudinal half-section: the pipe runs along the x axis,
 * the left end is cut open so the annulus (outer diameter, wall, bore) is
 * visible, and the right end carries the machined thread and the coupling.
 * Every dimension below is derived from the same axis and radii, so the walls
 * stay parallel by construction.
 */

export const CROSS_SECTION_VIEWBOX = '0 0 520 330';

/** Pipe axis and extent of the drawn body. */
export const AXIS_Y = 168;
export const BODY_X1 = 74;
export const BODY_X2 = 402;

/** Outer radius of the pipe body. */
export const OUTER_R = 78;
/**
 * Wall thickness, drawn thicker at the bottom than at the top: that difference
 * IS the eccentricity a seamless pipe is judged by, so the drawing shows it
 * rather than hiding it behind a nominal wall.
 */
export const WALL_TOP = 17;
export const WALL_BOTTOM = 23;

export const OUTER_TOP = AXIS_Y - OUTER_R;
export const OUTER_BOTTOM = AXIS_Y + OUTER_R;
export const BORE_TOP = OUTER_TOP + WALL_TOP;
export const BORE_BOTTOM = OUTER_BOTTOM - WALL_BOTTOM;

/** Half-width of the ellipse used to draw the cut end face. */
export const END_RX = 26;

/** Thread run on the pin end, and the coupling screwed over it. */
export const THREAD_X1 = 300;
export const THREAD_X2 = BODY_X2;
export const THREAD_TAPER = 9;
export const COUPLING_X1 = 292;
export const COUPLING_X2 = 436;
export const COUPLING_OVER = 15;

/** Number of thread crests drawn along the pin. */
export const THREAD_TEETH = 11;

/** Where each callout leader starts on the drawing. */
export const CALLOUT_ANCHORS: Record<string, { x: number; y: number }> = {
  surface: { x: 200, y: OUTER_TOP },
  wall: { x: 150, y: OUTER_TOP + WALL_TOP / 2 },
  bore: { x: 210, y: AXIS_Y },
  eccentricity: { x: 150, y: OUTER_BOTTOM - WALL_BOTTOM / 2 },
  thread: { x: 340, y: OUTER_TOP + 4 },
  coupling: { x: 414, y: AXIS_Y + 52 },
  seal: { x: 300, y: AXIS_Y - 46 },
};

/** Vertical position of each callout badge, all aligned on one column. */
export const CALLOUT_COLUMN_X = 476;
export const CALLOUT_ROWS: Record<string, number> = {
  surface: 34,
  wall: 76,
  bore: 118,
  eccentricity: 160,
  thread: 202,
  coupling: 244,
  seal: 286,
};

/**
 * Cross-section of the stock at every forming step, in tile units.
 * `inner: 0` is a solid billet; the piercing mill opens the bore, the mandrel
 * mill collapses the wall onto the mandrel, the sizing mill pulls the diameter
 * down. These are the numbers the forming tiles are drawn from.
 */
export const FORMING_RADII: Record<string, { inner: number; outer: number }> = {
  billet: { inner: 0, outer: 34 },
  heated: { inner: 0, outer: 35 },
  shell: { inner: 13, outer: 36 },
  rough: { inner: 18, outer: 29 },
  reduced: { inner: 15, outer: 23 },
  finished: { inner: 15.5, outer: 23 },
};

/** Steps drawn glowing hot rather than cold grey. */
export const HOT_FORMING_STEPS = new Set(['heated', 'shell', 'rough', 'reduced']);
