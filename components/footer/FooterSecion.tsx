import { FooterSocials } from "./FooterSocial";

type FooterSectionProps =
  | {
      title: string;
      description?: string;
      content?: string;
      type: "company";
    }
  | {
      title: string;
      links: { label: string; href: string }[];
      type?: never;
    };

export function FooterSection(props: FooterSectionProps) {
  if ("type" in props && props.type === "company") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <p className="text-gray-400">{props.description}</p>
        </div>
        <p className="text-gray-400">{props.content}</p>
        <FooterSocials />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold">{props.title}</h3>
      <ul className="space-y-2 text-gray-400">
        {props.links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
