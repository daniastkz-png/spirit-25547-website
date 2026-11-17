/** Aldente 3, exported from the team's Onshape assembly and compressed with glTF Transform (meshopt). */
export const CAD_MODEL = { src: "/cad/aldente-3.glb", size: "4.5 MB" };

/**
 * The meshopt-quantized file reports a 2 m bounding box to model-viewer, so its
 * auto-framing is useless: viewers set the camera target from the real geometry.
 */
export const CAD_TARGET = "0.0175m 0.15m 0.05m";

/** Loads the <model-viewer> element and points it at the self-hosted meshopt decoder. */
export async function loadModelViewer() {
  const { ModelViewerElement } = await import("@google/model-viewer");
  ModelViewerElement.meshoptDecoderLocation = "/vendor/meshopt_decoder.js";
}
