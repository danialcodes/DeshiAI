import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Replicate from 'replicate';
import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit';
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY || "",
});

export const POST = async (
    req: Request,
) => {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!replicate.auth) {
            return new NextResponse("Replicate API key not configured", { status: 500 });
        }
        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        const freeTrial = await checkApiLimit();
        if (!freeTrial) {
            return new NextResponse("You have exceeded the free trial limit", { status: 403 });
        }



        const response = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
            {
                input: {
                    prompt,
                    negative_prompt: "very blue, dust, noisy, washed out, ugly, distorted, broken",
                }
            }
        );

        await increaseApiLimit();


        return NextResponse.json(response);
    }
    catch (err) {
        console.log("[Music error]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}