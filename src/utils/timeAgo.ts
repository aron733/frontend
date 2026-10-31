export function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffEnSecondes = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffEnSecondes < 60) return "À l'instant";

  const diffEnMinutes = Math.floor(diffEnSecondes / 60);
  if (diffEnMinutes < 60) return `il y a ${diffEnMinutes} min`;

  const diffEnHeures = Math.floor(diffEnMinutes / 60);
  if (diffEnHeures < 24) return `il y a ${diffEnHeures} h`;

  const diffEnJours = Math.floor(diffEnHeures / 24);
  if (diffEnJours < 7) return `il y a ${diffEnJours} j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
