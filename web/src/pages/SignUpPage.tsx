import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const DIET_OPTIONS = ['Standard', 'High Protein', 'Vegetarian', 'Vegan', 'Keto', 'Paleo']
const GOAL_OPTIONS = ['🏋️ Build Muscle', '🔥 Fat Loss', '⚡ Energy', '🧘 Wellness', '🏃 Endurance', '💪 Strength']
const AVATARS = ['🐯', '🦁', '🐺', '🦊', '🐻', '🦅', '🐬', '🦋', '🐲', '⚡', '🔥', '💎']

export default function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const TOTAL = 5

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2
  const [age, setAge] = useState(24)
  const [height, setHeight] = useState(175)
  const [weight, setWeight] = useState(70)

  // Step 3
  const [diet, setDiet] = useState('')

  // Step 4
  const [goals, setGoals] = useState<string[]>([])
  const [avatar, setAvatar] = useState('🔥')

  // Step 5
  const inviteCode = 'TF' + Math.random().toString(36).substring(2, 6).toUpperCase()
  const [partnerCode, setPartnerCode] = useState('')

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const next = () => step < TOTAL ? setStep((s) => s + 1) : navigate('/mode-select')
  const back = () => step > 1 ? setStep((s) => s - 1) : navigate(-1)

  return (
    <div className="screen min-h-screen" style={{ background: '#0A0A0A' }}>
      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-14 pb-8 max-w-md mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={back} className="mr-2 text-lg" style={{ color: '#7A7570' }}>←</button>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ background: i + 1 === step ? '#FF5E1A' : i + 1 < step ? '#FF5E1A55' : '#242424' }}
              animate={{ width: i + 1 === step ? 24 : 8, height: 8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
          <span className="ml-auto font-body text-xs" style={{ color: '#7A7570' }}>{step}/{TOTAL}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            {step === 1 && (
              <>
                <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#F5F0EA' }}>JOIN TWINFIT</h1>
                <p className="font-body text-sm mb-8" style={{ color: '#7A7570' }}>Create your account to get started.</p>
                <div className="card flex flex-col gap-4">
                  {[
                    { label: 'FULL NAME', placeholder: 'Karim Doe', value: name, setter: setName, type: 'text' },
                    { label: 'EMAIL', placeholder: 'you@example.com', value: email, setter: setEmail, type: 'email' },
                    { label: 'PASSWORD', placeholder: '••••••••', value: password, setter: setPassword, type: 'password' },
                  ].map(({ label, placeholder, value, setter, type }) => (
                    <div key={label}>
                      <label className="font-body text-xs mb-1 block" style={{ color: '#7A7570' }}>{label}</label>
                      <input
                        className="input-field"
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#F5F0EA' }}>YOUR BODY</h1>
                <p className="font-body text-sm mb-8" style={{ color: '#7A7570' }}>We tailor everything to you.</p>
                <div className="card flex flex-col gap-6">
                  {[
                    { label: 'AGE', value: age, setter: setAge, unit: 'yrs', min: 16, max: 65 },
                    { label: 'HEIGHT', value: height, setter: setHeight, unit: 'cm', min: 140, max: 220 },
                    { label: 'WEIGHT', value: weight, setter: setWeight, unit: 'kg', min: 40, max: 150 },
                  ].map(({ label, value, setter, unit, min, max }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span className="font-body text-xs" style={{ color: '#7A7570' }}>{label}</span>
                        <span className="font-display text-lg tracking-wide px-3 py-0.5 rounded-lg" style={{ background: '#FF5E1A22', color: '#FF5E1A' }}>
                          {value} {unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                          style={{ background: '#242424', color: '#FF5E1A' }}
                          onClick={() => setter((v) => Math.max(min, v - 1))}
                        >−</button>
                        <input
                          type="range" min={min} max={max} value={value}
                          onChange={(e) => setter(Number(e.target.value))}
                          className="flex-1 accent-orange-500 h-1"
                        />
                        <button
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
                          style={{ background: '#242424', color: '#FF5E1A' }}
                          onClick={() => setter((v) => Math.min(max, v + 1))}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#F5F0EA' }}>YOUR DIET</h1>
                <p className="font-body text-sm mb-8" style={{ color: '#7A7570' }}>Pick your dietary preference.</p>
                <div className="flex flex-wrap gap-3">
                  {DIET_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiet(d)}
                      className="px-5 py-2.5 rounded-2xl font-body text-sm transition-all"
                      style={{
                        background: diet === d ? '#FF5E1A22' : '#141414',
                        border: `1px solid ${diet === d ? '#FF5E1A' : 'rgba(255,255,255,0.08)'}`,
                        color: diet === d ? '#FF5E1A' : '#F5F0EA',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#F5F0EA' }}>YOUR GOALS</h1>
                <p className="font-body text-sm mb-6" style={{ color: '#7A7570' }}>Select all that apply, then pick an avatar.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className="px-4 py-2 rounded-2xl font-body text-sm transition-all"
                      style={{
                        background: goals.includes(g) ? '#FF5E1A22' : '#141414',
                        border: `1px solid ${goals.includes(g) ? '#FF5E1A' : 'rgba(255,255,255,0.08)'}`,
                        color: goals.includes(g) ? '#FF5E1A' : '#F5F0EA',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="font-body text-xs mb-3" style={{ color: '#7A7570' }}>PICK YOUR AVATAR</p>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className="h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                      style={{
                        background: avatar === a ? '#FF5E1A22' : '#141414',
                        border: `2px solid ${avatar === a ? '#FF5E1A' : 'transparent'}`,
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#F5F0EA' }}>FIND YOUR DUO</h1>
                <p className="font-body text-sm mb-8" style={{ color: '#7A7570' }}>Share your code or enter your partner's.</p>
                <div className="card mb-4">
                  <p className="font-body text-xs mb-2" style={{ color: '#7A7570' }}>YOUR INVITE CODE</p>
                  <div className="h-14 rounded-xl flex items-center justify-center text-2xl font-display tracking-[0.4em]"
                    style={{ background: '#FF5E1A22', border: '1px dashed #FF5E1A', color: '#FF5E1A' }}>
                    {inviteCode}
                  </div>
                </div>
                <div className="card">
                  <label className="font-body text-xs mb-2 block" style={{ color: '#7A7570' }}>PARTNER'S CODE (OPTIONAL)</label>
                  <input
                    className="input-field text-center font-display text-xl tracking-[0.3em] uppercase"
                    placeholder="XXXXXX"
                    maxLength={6}
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-6">
          <button className="btn-primary" onClick={next}>
            {step === TOTAL ? 'START JOURNEY' : 'CONTINUE'}
          </button>
        </div>
      </div>
    </div>
  )
}
