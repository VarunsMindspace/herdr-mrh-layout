// MRH's sidebar header: the monogram, the wordmark, the terminal picker and
// the sidebar toggle. The tab bar keeps Herdr's own tabs mod.

import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { theme, run, window, layout, shared, setShared } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// The sidebar's rail goes by its width, not a flag: dragging its edge narrows it too.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

// To the rail (on macOS wide enough for the traffic lights), or back to the width it had.
function toggleSidebar() {
  const width = find(layout(), "sidebar")?.size?.px;
  if (!narrow()) setShared("sidebar.width", width);
  run("layout.resize", {
    id: "sidebar",
    px: narrow() ? shared("sidebar.width") ?? 272 : window()?.platform === "macos" ? 76 : 44,
  });
}

export default class MrhBrand extends View {
  button(t, id, icon, action) {
    return div()
      .id(id)
      .size(26)
      .flex_none()
      .flex()
      .items_center()
      .justify_center()
      .rounded(6)
      .text_color(t.muted)
      .hover((s) => s.bg(t.hover).text_color(t.foreground))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
      .on_click(action)
      .child(svg(`mods/mrh-brand/${icon}.svg`).size(14));
  }

  render() {
    const t = theme();
    const w = window();
    const collapsed = narrow();
    // On the macOS rail the traffic lights fill the row: draw nothing behind them.
    const macRail = collapsed && w?.platform === "macos";
    return h_flex()
      .size_full()
      .bg(t.chrome)
      .items_center()
      .pl(macRail ? 78 : collapsed ? 6 : w?.platform === "macos" ? 78 : 14)
      .pr(8)
      .gap(8)
      .when(!macRail, (el) =>
        el.child(
          div()
            .size(24)
            .flex_none()
            .rounded(6)
            .bg(t.accent)
            .flex()
            .items_center()
            .justify_center()
            .child(div().text_size(13).font_semibold().text_color(t.accent_foreground).child("M")),
        ),
      )
      .when(!collapsed && !macRail, (el) =>
        el.child(div().text_size(12.5).font_semibold().text_color(t.foreground).child("MRH")),
      )
      .child(div().flex_1())
      .when(!collapsed, (el) => el.child(this.button(t, "mrh-picker", "search", () => run("mod.open", { name: "picker" }))))
      .when(!collapsed && !macRail, (el) => el.child(this.button(t, "mrh-sidebar", "sidebar", toggleSidebar)));
  }
}
