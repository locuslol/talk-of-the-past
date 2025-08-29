import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleRegistration = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!inviteCode) {
      toast.error("Please enter an invite code.");
      return;
    }

    const db = getFirestore();
    const inviteRef = doc(db, "inviteCodes", inviteCode);

    try {
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists() || inviteSnap.data().used) {
        toast.error("Invalid or already used invite code!");
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name from invite
      const displayName = inviteSnap.data()["Display Name"];
      await updateProfile(user, { displayName });

      // Mark invite code as used
      await updateDoc(inviteRef, { used: true });

      toast.success(`Welcome, ${displayName}!`);
      setShowInviteModal(false);
      console.log("Account created and profile updated!");
    } catch (err) {
      console.error(err);
      // Handle specific firebase errors if needed
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already in use.");
      } else {
        toast.error("Error creating account.");
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      try {
        // Check if email is already in use before showing modal
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          toast.error("This email is already in use.");
          return;
        }
        // If email is not in use, show the invite modal.
        setShowInviteModal(true);
      } catch (error) {
        console.error("Error checking email availability:", error);
        toast.error("An error occurred while checking your email.");
      }
    } else {
      // Handle Sign In
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in!");
      } catch (err) {
        console.error(err);
        toast.error("Error signing in. Please check your credentials.");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (err) {
      console.error(err);
      toast.error("Error sending password reset email.");
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: "easeOut" } },
  });

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1F2937",
            color: "#F9FAFB",
            border: "1px solid #4B5563",
          },
        }}
      />

      {/* Main Form */}
      <motion.div
        className={`bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10 w-full max-w-md text-center border border-gray-700 ${
          showInviteModal ? "filter blur-sm" : ""
        }`}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Welcome */}
        <motion.h1 {...fadeUp(0.1)} className="text-3xl font-bold text-white mb-6">
          {isRegister ? "Create Account" : "Welcome Back"}
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-gray-400 mb-6">
          Sign {isRegister ? "up" : "in"} to continue to <span className="text-blue-400">Talk of the Past</span>
        </motion.p>

        {/* Email & Password Form */}
        <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
            <motion.input
              {...fadeUp(0.3)}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              whileHover={{ borderColor: "#60A5FA" }}
              transition={{ duration: 0.2 }}
            />

            <motion.input
              {...fadeUp(0.4)}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              whileHover={{ borderColor: "#60A5FA" }}
              transition={{ duration: 0.2 }}
            />

            {/* Confirm Password */}
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  key="confirm-password-wrapper"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                    whileHover={{ borderColor: "#60A5FA" }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In / Create Account Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              {isRegister ? "Create Account" : "Sign In"}
            </motion.button>

            {/* Forgot Password & Toggle */}
            <div className="pt-2 text-center space-y-2">
              <AnimatePresence>
                {!isRegister && (
                  <motion.p
                    key="forgot-password"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-400 cursor-pointer hover:underline"
                    whileHover={{ color: "#F9FAFB" }}
                  >
                    Forgot Password?
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.p
                key={isRegister ? "to-signin" : "to-signup"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-gray-400 cursor-pointer font-semibold"
                whileHover={{ color: "#F9FAFB" }}
              >
                {isRegister
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </motion.p>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Invite Code Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-xl p-8 w-full max-w-sm text-center border border-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Enter Invite Code</h2>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite Code"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-600 text-white font-semibold shadow-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegistration}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Login;