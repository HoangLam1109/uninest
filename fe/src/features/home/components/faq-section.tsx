import { homeFaqs } from '@/features/home/data'

export function FaqSection() {
  return (
    <section className="bg-white px-6 py-16 lg:px-20 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
            FAQ
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground lg:text-4xl">
            Giải đáp nhanh để tìm phòng phù hợp
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Các câu hỏi dưới đây trả lời trực tiếp những điều người thuê phòng thường
            quan tâm trước khi đặt lịch xem phòng tại TP.HCM.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {homeFaqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-3xl border border-primary/10 bg-surface px-5 py-5 shadow-sm"
            >
              <h3 className="text-lg font-bold text-foreground">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
