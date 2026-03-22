import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CirclePlus, Sparkles } from 'lucide-react';

const FEATURE_BANNER_IMAGE_URL =
  'https://res.cloudinary.com/dbbkqb3gq/image/upload/v1773849903/11-pointing-no-bg_hzxpsc.png';

export default function FeatureBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_right,_#d500ff_0%,_#8a16ff_38%,_#6016cc_68%,_#4b139f_100%)] px-5 py-6 shadow-[0_22px_50px_rgba(109,40,217,0.28)] sm:px-7 sm:py-7 lg:px-8">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/10 via-white/5 to-transparent blur-2xl" />
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-3xl" />
      <div className="absolute right-12 bottom-0 h-28 w-28 rounded-full bg-indigo-950/35 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6 lg:items-center lg:gap-8">
        <div className="flex shrink-0 items-end justify-center sm:w-[112px] lg:w-[128px]">
          <Image
            src={FEATURE_BANNER_IMAGE_URL}
            alt="AI assistant illustration"
            width={128}
            height={188}
            priority
            className="h-auto w-[76px] object-contain drop-shadow-[0_14px_24px_rgba(37,0,91,0.45)] sm:w-[94px] lg:w-[112px]"
          />
        </div>

        <div className="flex flex-1 flex-col items-start gap-4 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-black tracking-[0.06em] text-violet-100 uppercase">
              <Sparkles className="h-4 w-4 fill-current text-yellow-300" />
              <span>AI-Powered</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-[2.05rem]">
                Tạo bộ câu hỏi
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-violet-100/90 sm:text-base">
                Hệ thống tự động xây dựng câu hỏi dựa trên CV và yêu cầu tuyển dụng
              </p>
            </div>
          </div>

          <Link
            href="/candidate/interview-sets/create"
            className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(180deg,_rgba(76,10,145,0.92)_0%,_rgba(61,8,121,0.96)_100%)] px-5 py-3 text-base font-extrabold text-white shadow-[0_16px_28px_rgba(53,6,107,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,_rgba(89,17,164,0.96)_0%,_rgba(69,11,136,1)_100%)] sm:px-6"
          >
            <CirclePlus className="h-5 w-5 shrink-0" />
            <span>Tạo bộ câu hỏi</span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
