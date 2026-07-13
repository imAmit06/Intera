import { ENV } from "../lib/env.js";

export async function executeCode(req, res) {
  try {
    if (!ENV.PISTON_BASE_URL || !ENV.PISTON_API) {
      return res.status(500).json({ msg: "Piston proxy is not configured" });
    }

    const upstreamResponse = await fetch(
      `${ENV.PISTON_BASE_URL.replace(/\/$/, "")}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": ENV.PISTON_API,
        },
        body: JSON.stringify(req.body),
      },
    );

    const responseBody = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";

    res
      .status(upstreamResponse.status)
      .set("Content-Type", contentType)
      .send(responseBody);
  } catch (error) {
    console.error("Error in executeCode controller", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
