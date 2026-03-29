import { Clock, ArrowLeftRight, ShieldCheck, Truck, BadgeIndianRupee, Search, Star, Bell } from "lucide-react";

export default function UsedMachinesMarketplace() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">

      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12 pt-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-blue-200">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>

          <h1 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
            Buy & Sell Used Machines
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            SAI RoloTech's trusted marketplace for pre-owned industrial machines.
            Buy verified equipment or sell your old machinery — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <FeatureCard
            icon={<Search className="w-6 h-6 text-blue-600" />}
            bg="bg-blue-50 border-blue-100"
            title="Browse Listings"
            desc="Search and filter used machines by type, brand, condition, and price range."
          />
          <FeatureCard
            icon={<ArrowLeftRight className="w-6 h-6 text-emerald-600" />}
            bg="bg-emerald-50 border-emerald-100"
            title="Sell Your Machine"
            desc="List your used equipment in minutes. Reach thousands of verified buyers across India."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-violet-600" />}
            bg="bg-violet-50 border-violet-100"
            title="Verified by SAI RoloTech"
            desc="Every machine listing is verified by our technical team before going live."
          />
          <FeatureCard
            icon={<Truck className="w-6 h-6 text-orange-600" />}
            bg="bg-orange-50 border-orange-100"
            title="Doorstep Delivery"
            desc="We coordinate safe transportation and installation of purchased machines."
          />
          <FeatureCard
            icon={<BadgeIndianRupee className="w-6 h-6 text-rose-600" />}
            bg="bg-rose-50 border-rose-100"
            title="Best Price Guarantee"
            desc="Our pricing engine gives you fair market value — no guesswork, no hidden charges."
          />
          <FeatureCard
            icon={<Star className="w-6 h-6 text-amber-600" />}
            bg="bg-amber-50 border-amber-100"
            title="Rated Sellers & Buyers"
            desc="Trust ratings and review history on every transaction participant."
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Get Notified When We Launch</h2>
          <p className="text-slate-500 text-sm mb-6">
            We're working hard to bring you India's most trusted used machine marketplace.
            Contact our team to register your interest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:admin.sairolotech@gmail.com?subject=Interested in Used Machine Marketplace"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              Register Interest via Email
            </a>
            <a
              href="https://wa.me/919667146889?text=I%20am%20interested%20in%20the%20Used%20Machine%20Marketplace%20on%20SAI%20RoloTech%20CRM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          SAI RoloTech Used Machine Marketplace — Launching Soon &nbsp;·&nbsp; Trusted by Industry Professionals
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon, bg, title, desc,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className={`rounded-xl border p-5 flex gap-4 items-start ${bg}`}>
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 text-sm mb-1">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
