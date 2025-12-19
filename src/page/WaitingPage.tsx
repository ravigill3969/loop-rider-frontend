import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  CreditCard,
  User,
  Car,
  MapPin,
  AlertCircle,
} from "lucide-react";

export default function WaitingPage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [countdown, setCountdown] = useState(8);

  const stages = [
    { title: "Processing payment", icon: CreditCard },
    { title: "Verifying account", icon: User },
    { title: "Finding a driver", icon: Car },
    { title: "Getting location ready", icon: MapPin },
    { title: "All set", icon: CheckCircle },
  ];

  // Stage progress flow
  useEffect(() => {
    if (paymentFailed) return;

    const timer = setTimeout(() => {
      if (currentStage === 0) {
        // Fake payment fail chance
        if (Math.random() < 0.3) return setPaymentFailed(true);
      }

      if (currentStage < stages.length - 1) {
        setCurrentStage((prev) => prev + 1);
      }
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage, paymentFailed]);

  // Redirect countdown
  useEffect(() => {
    if (!paymentFailed) return;

    if (countdown === 0) {
      window.location.href = "/";
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [paymentFailed, countdown]);



  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* PAYMENT FAILED */}
        {paymentFailed ? (
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6 border border-gray-100">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment failed
              </h1>
              <p className="text-gray-500">Unable to process your payment</p>
            </div>

            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                <span className="text-sm text-gray-600 font-medium">
                  Redirecting in {countdown}s
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* HEADER */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {stages[currentStage].title}
                </h1>
                <p className="text-gray-500 text-sm">
                  This will only take a moment
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div
                className="h-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{
                  width: `${(currentStage / (stages.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* STEPS */}
            <div className="space-y-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === currentStage;
                const isDone = index < currentStage;

                return (
                  <div
                    key={stage.title}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-linear-to-r from-indigo-50 to-purple-50 shadow-sm"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon Bubble */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? "bg-linear-to-br from-green-400 to-emerald-500 shadow-md"
                            : isActive
                            ? "bg-linear-to-br from-indigo-500 to-purple-600 shadow-md"
                            : "bg-gray-100"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Icon
                            className={`w-6 h-6 ${
                              isActive ? "text-white" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>

                      {/* Title */}
                      <span
                        className={`text-base font-semibold transition-colors ${
                          isActive
                            ? "text-gray-900"
                            : isDone
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {stage.title}
                      </span>
                    </div>

                    {isActive && (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    )}
                    {isDone && (
                      <div className="w-5 h-5 rounded-full bg-green-100" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
