import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // 🧠 Log the trigger (you'll see this in Vercel logs)
  console.log("✅ Cron job ran at:", new Date().toISOString());

  // You can test external actions here too (like DB write, etc.)
  return NextResponse.json({
    message: "Cron job executed successfully",
    time: new Date().toISOString(),
  });
}
