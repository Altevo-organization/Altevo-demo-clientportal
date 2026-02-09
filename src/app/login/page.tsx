"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Users, Building2, Lock } from "lucide-react";
import { motion } from "framer-motion";

const DEMO_ACCOUNTS = [
  {
    label: "Client Admin",
    description: "Accès complet — TechCorp Solutions",
    email: "marie.dupont@techcorp.fr",
    password: "demo123456",
    icon: Shield,
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900",
  },
  {
    label: "Client Utilisateur",
    description: "Accès limité — TechCorp Solutions",
    email: "jean.martin@techcorp.fr",
    password: "demo123456",
    icon: Users,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900",
  },
  {
    label: "Autre organisation",
    description: "Admin — Groupe Innovex",
    email: "sophie.bernard@innovex.fr",
    password: "demo123456",
    icon: Building2,
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string, loginPassword: string, demoKey?: string) => {
    setError("");
    if (demoKey) {
      setDemoLoading(demoKey);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      router.push("/portal");
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
      setDemoLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <span className="text-lg font-bold text-foreground">A</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Altévo</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Portail client<br />sécurisé
          </h1>
          <p className="text-lg text-gray-400 max-w-md">
            Accédez à vos documents, suivez vos demandes et communiquez
            en toute sécurité avec votre équipe dédiée.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Chiffrement de bout en bout
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Conformité RGPD
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Altévo. Tous droits réservés.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <span className="text-lg font-bold text-background">A</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Altévo</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Accédez à votre espace client sécurisé
            </p>
          </div>

          {/* Demo buttons */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Accès démonstration
            </p>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleLogin(account.email, account.password, account.email)}
                disabled={!!demoLoading}
                className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors cursor-pointer ${account.color} disabled:opacity-50`}
              >
                <account.icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{account.label}</p>
                  <p className="text-xs opacity-75">{account.description}</p>
                </div>
                {demoLoading === account.email && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou connectez-vous
              </span>
            </div>
          </div>

          {/* Login form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
            className="space-y-4"
          >
            <Input
              id="email"
              label="Adresse e-mail"
              type="email"
              placeholder="nom@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            En vous connectant, vous acceptez nos conditions d&apos;utilisation
            et notre politique de confidentialité.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
