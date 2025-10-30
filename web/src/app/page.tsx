export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Online TCG Game Maker</h1>
      <p className="mt-2 text-gray-700">Choose where to start:</p>
      <ul className="mt-4 list-disc pl-6 space-y-2">
        <li><a className="underline" href="/portal">Portal</a></li>
        <li><a className="underline" href="/playtest">Playtest vs AI</a></li>
      </ul>
    </main>
  );
}