// app/api/proxy-download/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream",
    );

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
