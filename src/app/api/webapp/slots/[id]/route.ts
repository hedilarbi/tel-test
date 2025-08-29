import { NextRequest, NextResponse } from "next/server";
const API_BASE = "https://dfcecd72e396.ngrok-free.app";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const upstream = await fetch(`${API_BASE}/webapp/slots/${params.id}`, {
    method: "DELETE",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
