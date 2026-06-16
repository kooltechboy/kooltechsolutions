export const getCategoryColor = (category: string) => {
  switch (category) {
    case "Cybersecurity": return "#FF4444";
    case "Cloud": return "#00D4FF";
    case "AI & Automation": return "#A855F7";
    case "Network": return "#4B84C8";
    case "Compliance": return "#FFB300";
    default: return "#00D4FF";
  }
};

export const getFallbackImage = (category: string) => {
  switch (category) {
    case "Cybersecurity":
      return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600";
    case "Cloud":
      return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=600";
    case "AI & Automation":
      return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800&h=600";
    case "Network":
      return "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800&h=600";
    case "Compliance":
      return "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800&h=600";
    default:
      return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=600";
  }
};
