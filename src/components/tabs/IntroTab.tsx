/**
 * Tab 0 — Introduction.
 * A centered glassmorphism container, side-by-side layout: rounded-square
 * profile placeholder with a glowing teal border + the intro copy.
 * The neural network sits far behind this glass, blurred and rotating.
 */
export default function IntroTab() {
  return (
    <div className="flex h-full items-center justify-center px-4 sm:px-6">
      <div className="glass flex w-full max-w-4xl flex-col items-center gap-7 rounded-[28px] p-7 sm:flex-row sm:gap-9 sm:p-10">
        {/* Profile picture placeholder — frosted frame, teal glow */}
        <div className="shrink-0 rounded-2xl border border-[rgba(0,150,180,0.5)] bg-[rgba(0,150,180,0.1)] p-1.5 shadow-[0_0_55px_rgba(0,150,180,0.28)] backdrop-blur-xl">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="h-36 w-36 rounded-xl object-cover object-top sm:h-44 sm:w-44"
          />
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
            01 — Introduction
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Muhammad Ahzam
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            Computer Science · IBA Karachi
          </p>

          <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
            I&apos;m a Computer Science student at IBA who thrives on building,
            leading, and thinking outside the box. I believe that no challenge
            is too complex if you have the drive to conquer it, and I actively
            seek out unfamiliar environments to push my limits. I&apos;m open to
            working on anything, and I bring a &apos;part-time everything&apos;
            mindset to life—when I&apos;m not coding, you&apos;ll find me
            painting, playing football, teaching, attempting to sing, or running
            my photography page.
          </p>
        </div>
      </div>
    </div>
  )
}
