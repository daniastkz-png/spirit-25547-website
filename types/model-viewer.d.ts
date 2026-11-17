import type { ModelViewerElement } from "@google/model-viewer";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

// JSX typing for the <model-viewer> web component; its options are kebab-case attributes.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src?: string;
        alt?: string;
        exposure?: string;
        [attribute: `${string}-${string}`]: string | undefined;
      };
    }
  }
}
