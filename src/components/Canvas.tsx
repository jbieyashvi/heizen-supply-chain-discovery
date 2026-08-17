import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Plus, Minus, Maximize2, RotateCcw, Move } from "lucide-react";

export interface MiniNode {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Health key: unknown | healthy | friction | critical */
  tone: string;
}

interface CanvasProps {
  /** World bounds used for fit + minimap. */
  contentWidth: number;
  contentHeight: number;
  nodes: MiniNode[];
  /** Change this to re-fit the view (e.g. on level / view change). */
  fitKey: string;
  /** Minimap is only shown in the Detailed Process view. */
  showMinimap?: boolean;
  children: ReactNode;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/* Zoom is capped to 60%–150% so the flow always stays legible. */
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const PAD = 40;

export function Canvas({
  contentWidth,
  contentHeight,
  nodes,
  fitKey,
  showMinimap = false,
  children,
}: CanvasProps) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 1, h: 1 });
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const pan = useRef<null | { px: number; py: number; ox: number; oy: number }>(
    null
  );
  // Auto-fit until the user zooms/pans, so the layout settles (e.g. the
  // sidebar collapsing on entry) without ever clipping nodes.
  const interacted = useRef(false);

  /** Fit the whole diagram into the viewport, biased to fill the width. */
  const fitInto = useCallback(
    (w: number, h: number) => {
      if (w < 2 || h < 2) return;
      const scale = clamp(
        Math.min((w - PAD * 2) / contentWidth, (h - PAD * 2) / contentHeight),
        MIN_SCALE,
        MAX_SCALE
      );
      const x = (w - contentWidth * scale) / 2;
      const y = (h - contentHeight * scale) / 2;
      setT({ scale, x, y });
    },
    [contentWidth, contentHeight]
  );

  // Measure viewport and keep it current.
  useLayoutEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setVp({ w: r.width, h: r.height });
      return r;
    };
    const r = measure();
    fitInto(r.width, r.height);
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setVp({ w: rect.width, h: rect.height });
      // Keep the content framed until the user takes control.
      if (!interacted.current) fitInto(rect.width, rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fit when the content changes (level / view) and re-enable auto-fit.
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    interacted.current = false;
    const r = el.getBoundingClientRect();
    fitInto(r.width, r.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    interacted.current = true;
    setT((prev) => {
      const scale = clamp(prev.scale * factor, MIN_SCALE, MAX_SCALE);
      const wx = (cx - prev.x) / prev.scale;
      const wy = (cy - prev.y) / prev.scale;
      return { scale, x: cx - wx * scale, y: cy - wy * scale };
    });
  }, []);

  // Wheel zoom needs a non-passive native listener so preventDefault() can
  // stop the page from scrolling while zooming the canvas.
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 0.9);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only pan from the background, never from a node or control.
    if ((e.target as HTMLElement).closest("[data-node],button,a")) return;
    interacted.current = true;
    pan.current = { px: e.clientX, py: e.clientY, ox: t.x, oy: t.y };
    vpRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pan.current) return;
    setT((prev) => ({
      ...prev,
      x: pan.current!.ox + (e.clientX - pan.current!.px),
      y: pan.current!.oy + (e.clientY - pan.current!.py),
    }));
  };
  const endPan = (e: React.PointerEvent) => {
    pan.current = null;
    try {
      vpRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  // Fit-to-screen frames the whole diagram; Reset returns to the default fit
  // and clears the "user has taken control" flag so it re-frames on resize.
  const fit = () => {
    interacted.current = true;
    fitInto(vp.w, vp.h);
  };
  const reset = () => {
    interacted.current = false;
    fitInto(vp.w, vp.h);
  };
  const zoomButton = (factor: number) => zoomAt(vp.w / 2, vp.h / 2, factor);
  const pct = Math.round(t.scale * 100);

  // Minimap geometry
  const MM_W = 176;
  const MM_H = 116;
  const mmPad = 8;
  const mmScale = Math.min(
    (MM_W - mmPad * 2) / contentWidth,
    (MM_H - mmPad * 2) / contentHeight
  );
  const mmOffX = (MM_W - contentWidth * mmScale) / 2;
  const mmOffY = (MM_H - contentHeight * mmScale) / 2;
  // Visible world region → minimap rect
  const viewRect = {
    x: mmOffX + (-t.x / t.scale) * mmScale,
    y: mmOffY + (-t.y / t.scale) * mmScale,
    w: (vp.w / t.scale) * mmScale,
    h: (vp.h / t.scale) * mmScale,
  };

  return (
    <div className="pmap-canvas">
      <div
        className="pmap-vp"
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          className="pmap-world"
          style={{
            transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
            width: contentWidth,
            height: contentHeight,
          }}
        >
          {children}
        </div>

        {/* Sticky toolbar (top-right): zoom out · % · zoom in · fit · reset */}
        <div className="pmap-toolbar-map" role="toolbar" aria-label="Map controls">
          <button
            className="pmap-ctrl"
            onClick={() => zoomButton(0.9)}
            aria-label="Zoom out"
            title="Zoom out"
            disabled={pct <= MIN_SCALE * 100 + 0.5}
          >
            <Minus />
          </button>
          <span className="pmap-zoom" aria-live="polite" title="Current zoom">
            {pct}%
          </span>
          <button
            className="pmap-ctrl"
            onClick={() => zoomButton(1.1)}
            aria-label="Zoom in"
            title="Zoom in"
            disabled={pct >= MAX_SCALE * 100 - 0.5}
          >
            <Plus />
          </button>
          <span className="pmap-toolbar-sep" aria-hidden />
          <button
            className="pmap-ctrl"
            onClick={fit}
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <Maximize2 />
          </button>
          <button
            className="pmap-ctrl"
            onClick={reset}
            aria-label="Reset view"
            title="Reset view"
          >
            <RotateCcw />
          </button>
        </div>

        <div className="pmap-hint" aria-hidden>
          <Move /> Drag to move · Scroll to zoom
        </div>

        {/* Minimap — Detailed Process view only */}
        {showMinimap && (
          <div
            className="pmap-minimap"
            aria-hidden
            style={{ width: MM_W, height: MM_H }}
          >
            {nodes.map((n, i) => (
              <span
                key={i}
                className={`pmap-mm-node tone-${n.tone}`}
                style={{
                  left: mmOffX + n.x * mmScale,
                  top: mmOffY + n.y * mmScale,
                  width: Math.max(3, n.w * mmScale),
                  height: Math.max(3, n.h * mmScale),
                }}
              />
            ))}
            <span
              className="pmap-mm-view"
              style={{
                left: clamp(viewRect.x, 0, MM_W),
                top: clamp(viewRect.y, 0, MM_H),
                width: clamp(viewRect.w, 6, MM_W),
                height: clamp(viewRect.h, 6, MM_H),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
