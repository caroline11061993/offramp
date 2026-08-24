import type { ComponentProps } from "react";

/** MDX element overrides for guide bodies — currently just wraps tables in a
 *  horizontally-scrollable container so wide comparison tables never force
 *  the page itself to scroll sideways on mobile. */
export const mdxComponents = {
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};
