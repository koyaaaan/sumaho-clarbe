import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | スマホクラーベ",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex text-sm text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
      >
        ← トップへ戻る
      </Link>

      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        お問い合わせ
      </h1>

      <div className="space-y-6 text-sm leading-7 text-gray-700 dark:text-gray-300">
        <p>
          スマホクラーベに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
        </p>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            連絡先
          </h2>
          <p>
            メールアドレス:{" "}
            <a
              href="mailto:yohakuworks0@gmail.com"
              className="underline underline-offset-2 hover:opacity-80"
            >
              yohakuworks0@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            注意事項
          </h2>
          <p>内容によっては、返信までお時間をいただく場合があります。</p>
          <p>
            掲載しているスマートフォンの価格、在庫、契約条件等については、各販売事業者または提供事業者の情報をご確認ください。
          </p>
        </section>
      </div>
    </main>
  );
}
