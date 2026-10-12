"use client";

import { useEffect, useState } from "react";

type Citizen = {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  createdAt?: string;
};

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      setLoading(true);

      /*
       * Citizen API may be connected here later.
       * For now we try the existing users endpoint.
       */

      const response = await fetch("/api/users");

      if (!response.ok) {
        setCitizens([]);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setCitizens(data);
      } else if (Array.isArray(data.users)) {
        setCitizens(data.users);
      } else if (Array.isArray(data.citizens)) {
        setCitizens(data.citizens);
      } else {
        setCitizens([]);
      }
    } catch (error) {
      console.error("Error fetching citizens:", error);
      setCitizens([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCitizens = citizens.filter((citizen) => {
    const searchText = search.toLowerCase();

    return (
      (citizen.fullName || citizen.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (citizen.email || "")
        .toLowerCase()
        .includes(searchText) ||
      (citizen.mobile || citizen.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      (citizen.district || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  const getName = (citizen: Citizen) => {
    return citizen.fullName || citizen.name || "Citizen";
  };

  const getPhone = (citizen: Citizen) => {
    return citizen.mobile || citizen.phone || "Not available";
  };

  const getLocation = (citizen: Citizen) => {
    const parts = [
      citizen.village,
      citizen.district,
      citizen.state,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "Location not available";
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Citizens
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage registered CityCare citizens.
          </p>
        </div>

        <button
          onClick={fetchCitizens}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Citizens
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {citizens.length}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Registered
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {citizens.length}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">
              ✓
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Search Results
              </p>

              <p className="text-3xl font-bold text-purple-600 mt-2">
                {filteredCitizens.length}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">
              🔎
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Citizens
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or district..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* CITIZEN LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">
            Registered Citizens
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredCitizens.length} citizen(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading citizens...
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="p-12 text-center">

            <div className="text-4xl mb-4">
              👥
            </div>

            <h3 className="font-semibold text-gray-900">
              No citizens found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Registered citizens will appear here.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-gray-200">

            {filteredCitizens.map((citizen) => {
              const name = getName(citizen);

              return (
                <div
                  key={citizen._id || citizen.id || name}
                  className="p-5 hover:bg-gray-50 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                    {/* AVATAR */}
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold">
                        {getInitial(name)}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-gray-900">
                          {name}
                        </h3>

                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Citizen
                        </span>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mt-3">

                        <div>
                          <p className="text-xs text-gray-400">
                            Email
                          </p>

                          <p className="text-sm text-gray-700 truncate">
                            {citizen.email || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Mobile
                          </p>

                          <p className="text-sm text-gray-700">
                            {getPhone(citizen)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Location
                          </p>

                          <p className="text-sm text-gray-700 truncate">
                            {getLocation(citizen)}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* REGISTERED DATE */}
                    <div className="lg:text-right flex-shrink-0">

                      <p className="text-xs text-gray-400">
                        Registered
                      </p>

                      <p className="text-sm text-gray-700 mt-1">
                        {formatDate(citizen.createdAt)}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}