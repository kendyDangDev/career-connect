import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  avatar: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn Anh',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Software Developer',
    company: 'FPT Software',
    rating: 5,
    text: 'Career Connect đã giúp tôi tìm được công việc mơ ước! Quy trình nộp hồ sơ diễn ra suôn sẻ và tôi nhận được nhiều lời mời làm việc chỉ trong vài tuần.',
    date: '2 tuần trước',
  },
  {
    id: '2',
    userName: 'Trần Thị Bích',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'Marketing Manager',
    company: 'Shopee Vietnam',
    rating: 5,
    text: 'Nền tảng tuyệt vời với các vị trí tuyển dụng chính xác. Thuật toán gợi ý việc làm thực sự hiệu quả! Rất khuyến khích sử dụng.',
    date: '1 tháng trước',
  },
  {
    id: '3',
    userName: 'Lê Văn Cường',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'UI/UX Designer',
    company: 'VNG Corporation',
    rating: 4,
    text: 'Đa dạng về công việc và giao diện rất dễ sử dụng. Tôi đã tìm được vị trí hiện tại của mình thông qua ứng dụng này.',
    date: '1 tháng trước',
  },
  {
    id: '4',
    userName: 'Phạm Thùy Linh',
    avatar: 'https://i.pravatar.cc/150?img=9',
    role: 'Data Analyst',
    company: 'Tiki',
    rating: 5,
    text: 'Giao diện hiện đại, tìm kiếm nhanh chóng. CareerConnect là lựa chọn hàng đầu của tôi khi tìm việc làm mới.',
    date: '3 tuần trước',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function UserReviewsSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50/50 via-white to-white py-10">
      {/* Header */}
      <div className="mb-12 text-center">
        <span className="mb-2 inline-block text-sm font-semibold tracking-widest text-purple-500 uppercase">
          Đánh giá từ ứng viên
        </span>
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Hàng nghìn người đã{' '}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            thành công
          </span>
        </h2>
        <p className="mt-3 text-gray-500 md:text-lg">
          Những câu chuyện thực tế từ ứng viên đã tìm được việc làm qua CareerConnect
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50"
          >
            {/* Quote icon */}
            <Quote className="h-8 w-8 text-purple-100 transition-colors group-hover:text-purple-200" />

            {/* Rating */}
            <StarRating count={review.rating} />

            {/* Text */}
            <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-gray-600">
              &ldquo;{review.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-purple-100">
                <Image
                  src={review.avatar}
                  alt={review.userName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{review.userName}</p>
                <p className="truncate text-xs text-gray-500">
                  {review.role} · {review.company}
                </p>
              </div>
            </div>

            {/* Date */}
            <span className="absolute top-4 right-4 text-xs text-gray-400">{review.date}</span>

            {/* Hover gradient overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/0 to-indigo-50/0 transition group-hover:from-purple-50/30 group-hover:to-indigo-50/20" />
          </div>
        ))}
      </div>

      {/* Overall rating */}
      <div className="mt-12 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-3 text-4xl font-extrabold text-gray-900">
          4.9
          <StarRating count={5} />
        </div>
        <p className="text-gray-500">Dựa trên hơn 12,000 đánh giá từ người dùng</p>
      </div>
    </section>
  );
}
