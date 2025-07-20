import React, { useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import {
  Download,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { CardItem, IUser } from "@/types/user-type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

interface MinimalCardProps {
  me: IUser | any; // TODO: Remove 'any' and use proper typing
  card: CardItem;
  idx: number;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

const MinimalCard: React.FC<MinimalCardProps> = ({
  me,
  card,
  idx,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  // Memoized user initials for fallback avatar
  const userInitials = useMemo(() => {
    const fullName =
      me?.data?.full_name || me?.data?.user_name || "Unknown User";
    return fullName
      .split(" ")
      .map((name: string) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [me?.data?.full_name, me?.data?.user_name]);

  // Memoized safe filename
  const safeFileName = useMemo(() => {
    const name = me?.data?.full_name || me?.data?.user_name || "Unknown_User";
    return name.replace(/[^a-zA-Z0-9]/g, "_");
  }, [me?.data?.full_name, me?.data?.user_name]);

  // Convert image to base64 with error handling
  const convertToBase64 = useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result?.toString();
          const base64Data = result?.split(",")[1];
          resolve(base64Data || "");
        };
        reader.onerror = () =>
          reject(new Error("Failed to convert image to base64"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Failed to convert avatar to base64:", error);
      return "";
    }
  }, []);

  // Generate and download vCard
  const handleDownloadVCard = useCallback(async () => {
    try {
      onDownloadStart?.();

      // Convert avatar to base64 if available
      const avatarBase64 = me?.data?.avatar
        ? await convertToBase64(me.data.avatar)
        : "";

      // Generate vCard content with proper escaping
      const escapeVCardValue = (value: string) =>
        value?.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n") || "";

      const vCardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCardValue(me?.data?.full_name || "")}`,
        `N:${escapeVCardValue(me?.data?.full_name || "")};;;;`,
        `ORG:${escapeVCardValue(card.company || "")}`,
        `TITLE:${escapeVCardValue(card.job || "")}`,
        `TEL;TYPE=WORK,VOICE:${escapeVCardValue(card.phone || "")}`,
        `EMAIL;TYPE=PREF,INTERNET:${escapeVCardValue(me?.data?.email || "")}`,
        avatarBase64 ? `PHOTO;ENCODING=b;TYPE=JPEG:${avatarBase64}` : "",
        `URL:${escapeVCardValue(card.web_site || "")}`,
        `ADR;TYPE=WORK:;;${escapeVCardValue(card.address || "")};;;;`,
        `NOTE:${escapeVCardValue(card.bio || "")}`,
        "END:VCARD",
      ].filter((line) => line && !line.endsWith(":"));

      const vCardContent = vCardLines.join("\r\n");

      // Create and download blob
      const blob = new Blob([vCardContent], {
        type: "text/vcard;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeFileName}_card_${idx + 1}.vcf`;
      link.setAttribute(
        "aria-label",
        `Download vCard for ${me?.data?.full_name || "contact"}`
      );

      // Temporary DOM manipulation for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      onDownloadComplete?.();
    } catch (error) {
      const downloadError =
        error instanceof Error ? error : new Error("Download failed");
      console.error("vCard download error:", downloadError);
      onDownloadError?.(downloadError);
    }
  }, [
    me,
    card,
    idx,
    safeFileName,
    convertToBase64,
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
  ]);

  // Render contact info item
  const ContactInfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
  }> = ({ icon, label, value, href }) => {
    if (!value) return null;

    const content = (
      <div className="flex items-center justify-between border-b border-amber-200 pb-2 group">
        <div className="flex items-center gap-3">
          <div className="text-amber-600 group-hover:text-amber-700 transition-colors">
            {icon}
          </div>
          <span className="text-sm font-medium text-amber-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-800 break-all">{value}</span>
          {href && (
            <ExternalLink className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    );

    return href ? (
      <a
        href={href}
        className="block hover:bg-amber-50 -mx-2 px-2 py-1 rounded transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}: ${value}`}
      >
        {content}
      </a>
    ) : (
      <div className="hover:bg-amber-50 -mx-2 px-2 py-1 rounded transition-colors">
        {content}
      </div>
    );
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <Card className="bg-white border-4 border-amber-600 shadow-xl relative hover:shadow-2xl transition-shadow duration-300">
        {/* Edit Button */}
        <Link href={`/update-card/${card.id}`} aria-label="Edit card">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 transition-colors z-10"
          >
            <Pencil className="w-5 h-5" />
          </Button>
        </Link>

        <CardContent className="p-8">
          {/* Header Section */}
          <header className="text-center border-b-2 border-amber-600 pb-6 mb-6">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 mx-auto border-4 border-amber-600 shadow-lg">
                <AvatarImage
                  src={me?.data?.avatar}
                  alt={`${
                    me?.data?.full_name || me?.data?.user_name
                  }'s profile picture`}
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            <h1 className="text-2xl font-bold text-amber-900 mb-2 font-serif tracking-wide">
              {me?.data?.full_name || me?.data?.user_name || "Unknown User"}
            </h1>

            {card.job && (
              <div className="bg-amber-600 text-white px-4 py-1 rounded-full inline-block mb-2">
                <span className="text-sm font-medium">{card.job}</span>
              </div>
            )}

            {card.company && (
              <p className="text-amber-700 font-medium font-serif">
                {card.company}
              </p>
            )}
          </header>

          {/* Bio Section */}
          {card.bio && (
            <section className="text-center mb-6" aria-labelledby="bio-heading">
              <h2 id="bio-heading" className="sr-only">
                Biography
              </h2>
              <p className="text-amber-800 text-sm leading-relaxed font-serif italic">
                {card.bio}
              </p>
            </section>
          )}

          {/* Contact Information */}
          <section className="space-y-4 mb-6" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="sr-only">
              Contact Information
            </h2>

            <ContactInfoItem
              icon={<Phone className="w-4 h-4" />}
              label="Telephone"
              value={card.phone}
              href={card.phone ? `tel:${card.phone}` : undefined}
            />

            <ContactInfoItem
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={me?.data?.email}
              href={me?.data?.email ? `mailto:${me.data.email}` : undefined}
            />

            <ContactInfoItem
              icon={<Globe className="w-4 h-4" />}
              label="Website"
              value={card.web_site}
              href={
                card.web_site?.startsWith("http")
                  ? card.web_site
                  : `https://${card.web_site}`
              }
            />

            <ContactInfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Address"
              value={card.address}
            />
          </section>

          {/* Actions */}
          <section className="space-y-3" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="sr-only">
              Actions
            </h2>

            {/* Download vCard Button */}
            <Button
              onClick={handleDownloadVCard}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-serif transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="Download contact as vCard"
            >
              <Download className="w-4 h-4 mr-2" />
              Add to Address Book
            </Button>

            {/* Social Links */}
            {card.socialLinks && card.socialLinks.length > 0 && (
              <div className="space-y-2">
                <h3 className="sr-only">Social Links</h3>
                {card.socialLinks.map((socialLink, socialIdx) => (
                  <Button
                    key={`${socialLink.platform}-${socialIdx}`}
                    variant="outline"
                    className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 font-serif bg-transparent transition-colors duration-200 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    onClick={() => {
                      if (socialLink.url) {
                        window.open(
                          socialLink.url,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    aria-label={`Visit ${socialLink.platform} profile`}
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage
                        src={socialLink.icon}
                        alt={`${socialLink.platform} icon`}
                      />
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {socialLink.platform?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {socialLink.platform}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimalCard;
