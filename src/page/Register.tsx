import { useRegister } from "@/api/auth-api";
import type { RegisterRequestT } from "@/api/auth-api-types";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

const initialPayload: RegisterRequestT = {
  email: "",
  full_name: "",
  password: "",
  phone_number: "",
  birth_month: "",
  birth_year: 0,
};

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Register() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState("");
  const [payload, setPayload] = useState<RegisterRequestT>(initialPayload);

  const { mutate, isPending, error } = useRegister();

  const updateField = (
    field: keyof RegisterRequestT,
    value: string | number,
  ) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    payload.email.trim() &&
    payload.full_name.trim() &&
    payload.password.trim() &&
    payload.phone_number.trim() &&
    payload.birth_month.trim() &&
    payload.birth_year > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    mutate(payload, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const inputClass = (name: string) =>
    `w-full px-4 py-2.5 bg-white text-slate-900 rounded-lg border ${
      focused === name
        ? "border-blue-500 ring-4 ring-blue-50"
        : "border-slate-300"
    } placeholder-slate-400 focus:outline-none transition-all duration-200`;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Create account
          </h1>
          <p className="text-slate-600">Enter your registration details</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full name
              </label>
              <input
                type="text"
                value={payload.full_name}
                onChange={(event) =>
                  updateField("full_name", event.target.value)
                }
                onFocus={() => setFocused("full_name")}
                onBlur={() => setFocused("")}
                className={inputClass("full_name")}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={payload.email}
                onChange={(event) => updateField("email", event.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                className={inputClass("email")}
                placeholder="test@test.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={payload.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                className={inputClass("password")}
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={payload.phone_number}
                onChange={(event) =>
                  updateField("phone_number", event.target.value)
                }
                onFocus={() => setFocused("phone_number")}
                onBlur={() => setFocused("")}
                className={inputClass("phone_number")}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Birth month
                </label>
                <select
                  value={payload.birth_month}
                  onChange={(event) =>
                    updateField("birth_month", event.target.value)
                  }
                  onFocus={() => setFocused("birth_month")}
                  onBlur={() => setFocused("")}
                  className={inputClass("birth_month")}
                  required
                >
                  <option value="" disabled>
                    Select month
                  </option>
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Birth year
                </label>
                <input
                  type="number"
                  value={payload.birth_year || ""}
                  onChange={(event) =>
                    updateField("birth_year", Number(event.target.value) || 0)
                  }
                  onFocus={() => setFocused("birth_year")}
                  onBlur={() => setFocused("")}
                  className={inputClass("birth_year")}
                  placeholder="1998"
                  required
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600">
                {error.message || "Registration failed"}
              </p>
            ) : null}

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Back to login
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isPending}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
