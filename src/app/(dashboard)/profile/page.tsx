"use client";

import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { userRequest } from "@/lib/api/get-me-api";
import { useQuery } from "@tanstack/react-query";
import { CardItem } from "@/types/user-type";
import CorporateCard from "@/components/cards/corporate-card";
import MinimalCard from "@/components/cards/minimal-card";
import ModernCard from "@/components/cards/modern-card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Camera, Plus, Mail } from "lucide-react";
import { authRequest } from "@/lib/api/auth-api";
import { useRouter } from "next/navigation";

const Profile = () => {
  const router = useRouter();
  const { PROFILE, GET_CARDS } = userRequest();
  const { AUTH_LOGOUT } = authRequest();
  const { data: me, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => PROFILE(),
  });

  const { data: userCards, isLoading: cardsLoading } = useQuery({
    queryKey: ["user-cards"],
    queryFn: async () => GET_CARDS(),
  });

  // console.log(userCards);

  if (isLoading || cardsLoading) {
    return <LoadingSpinner />;
  }

  const infoItems = [
    { label: "Full Name", value: me?.data.full_name },
    { label: "Username", value: me?.data.user_name },
    { label: "Email", value: me?.data.email },
  ];

  // handler function
  const handleLogout = () => {
    AUTH_LOGOUT();
    router.push("/login");
  };

  const handleEditProfile = () => {
    console.log("===pop up edit profile input fields with default value===");
  };

  const handleCreateCard = () => {
    console.log("===Navigate to create card page===");
  };

  const handleAddMoreCard = () => {
    console.log("===Navigate to create card input fields===");
  };

  const AvatarProfileImage =
    "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  const renderCardComponent = (card: CardItem, index: any) => {
    // console.log(card, "===card user data===");
    switch (card.card_type) {
      case "Corporate":
        return <CorporateCard key={card.id} card={card} me={me} idx={index} />;
      case "Minimal":
        return <MinimalCard key={card.id} card={card} me={me} idx={index} />;
      case "Modern":
        return <ModernCard key={card.id} card={card} me={me} idx={index} />;
      default:
        return <MinimalCard key={card.id} card={card} me={me} idx={index} />;
    }
  };

  const hasCards = userCards && userCards.cards.length > 0;
  const hasOneCard = userCards && userCards.cards.length === 1;

  return (
    <>
      {/* Profile Header */}
      <header className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Logout Button */}
          <div className="flex justify-end pt-6">
            <Button onClick={handleLogout} variant="outline">
              {" "}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>

          <div className="flex justify-center py-12">
            <div className="text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                {/* avata image */}
                <Avatar className="w-full h-full rounded-full bg-white shadow-2xl flex items-center justify-center ring-4 ring-white/30">
                  <AvatarImage
                    src={AvatarProfileImage}
                    alt="@evilrabbit"
                    className="w-20 h-20 text-gray-500"
                  />
                </Avatar>

                {/* Upload Photo */}
                <Button
                  type="button"
                  className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-colors focus:outline-none"
                  aria-label="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {me?.data.full_name}
                </h1>
                <p className="text-blue-100 text-md">{me?.data.user_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <main className="space-y-10">
            {/* Profile Info */}
            <section
              aria-labelledby="profile-info-heading"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  id="profile-info-heading"
                  className="text-xl font-semibold text-gray-900"
                >
                  Profile Information
                </h2>
                <Button
                  onClick={handleEditProfile}
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none"
                >
                  Edit Profile
                </Button>
              </div>

              <ul className="space-y-4">
                {infoItems.map(({ label, value }) => (
                  <li
                    key={label}
                    className="flex justify-between border-b border-gray-100 pb-3 last:border-none"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {label}
                    </span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Cards Section */}
            {!hasCards ? (
              /* Create Card Section - Show when user has no cards */
              <section
                aria-labelledby="create-card-heading"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h2
                    id="create-card-heading"
                    className="text-xl font-semibold text-gray-900 mb-2"
                  >
                    Create Your Digital ID Card
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Generate a secure digital ID card with your verified
                    information. Your card will be ready for download and
                    sharing.
                  </p>

                  <Button
                    onClick={handleCreateCard}
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-6 rounded-lg text-base font-medium transition-colors shadow-md hover:shadow-lg focus:outline-none"
                  >
                    <div className="flex items-center justify-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Create Card
                    </div>
                  </Button>
                </div>
              </section>
            ) : (
              /* User Cards Section - Show when user has cards */
              <section
                aria-labelledby="user-cards-heading"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  {hasOneCard && (
                    <Button
                      onClick={handleAddMoreCard}
                      type="button"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More Card
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCards.cards.map((card: CardItem, index: number) =>
                    renderCardComponent(card, index)
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;
