// Scènes SVG animées pour l'écran d'accueil VOKYVO

export function SceneWelcome() {
  return (
    <g>
      <circle cx="100" cy="100" r="60" fill="url(#g1)" opacity="0.15">
        <animate attributeName="r" values="60;70;60" dur="2s" repeatCount="indefinite" />
      </circle>
      <path
        d="M60 80 Q60 60 80 60 L140 60 Q160 60 160 80 L160 120 Q160 140 140 140 L80 140 L60 160 Z"
        fill="url(#g1)"
        stroke="url(#g1)"
        strokeWidth="2"
        strokeDasharray="400"
        strokeDashoffset="400"
      >
        <animate attributeName="stroke-dashoffset" from="400" to="0" dur="1.5s" fill="freeze" />
      </path>
      <text x="100" y="108" textAnchor="middle" fontSize="28" fontWeight="bold" fill="white">V</text>
    </g>
  );
}

export function SceneChat() {
  return (
    <g>
      <rect x="30" y="50" width="80" height="40" rx="15" fill="#667eea" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate" values="-30,0;0,0" dur="0.5s" fill="freeze" />
      </rect>
      <circle cx="55" cy="70" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.5s" fill="freeze" />
      </circle>
      <circle cx="70" cy="70" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.6s" fill="freeze" />
      </circle>
      <circle cx="85" cy="70" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.7s" fill="freeze" />
      </circle>
      <rect x="90" y="110" width="80" height="40" rx="15" fill="#764ba2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate" values="30,0;0,0" dur="0.5s" begin="1s" fill="freeze" />
      </rect>
      <circle cx="120" cy="130" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.5s" fill="freeze" />
      </circle>
      <circle cx="135" cy="130" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.6s" fill="freeze" />
      </circle>
      <circle cx="150" cy="130" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.7s" fill="freeze" />
      </circle>
    </g>
  );
}

export function SceneGroupes() {
  return (
    <g>
      <circle cx="60" cy="80" r="25" fill="#667eea" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
      </circle>
      <circle cx="140" cy="80" r="25" fill="#764ba2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.3s" fill="freeze" />
      </circle>
      <circle cx="100" cy="140" r="25" fill="#5a67d8" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.6s" fill="freeze" />
      </circle>
      <line x1="60" y1="80" x2="140" y2="80" stroke="#667eea" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.5s" begin="1s" fill="freeze" />
      </line>
      <line x1="60" y1="80" x2="100" y2="140" stroke="#667eea" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.5s" begin="1.2s" fill="freeze" />
      </line>
      <line x1="140" y1="80" x2="100" y2="140" stroke="#667eea" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.5s" begin="1.4s" fill="freeze" />
      </line>
    </g>
  );
}

export function SceneIA() {
  return (
    <g>
      <circle cx="100" cy="100" r="50" fill="none" stroke="#667eea" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="35" fill="url(#g1)" opacity="0.9">
        <animate attributeName="r" values="35;38;35" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <path d="M100 80 L105 95 L120 100 L105 105 L100 120 L95 105 L80 100 L95 95 Z" fill="white" />
      <circle cx="60" cy="60" r="3" fill="#667eea">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="70" r="3" fill="#764ba2">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="140" r="3" fill="#5a67d8">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="1s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

export function SceneVisio() {
  return (
    <g>
      <rect x="50" y="70" width="100" height="70" rx="12" fill="#667eea" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
      </rect>
      <circle cx="100" cy="105" r="20" fill="#764ba2" />
      <circle cx="100" cy="100" r="7" fill="white" />
      <ellipse cx="100" cy="115" rx="12" ry="8" fill="white" />
      <path d="M40 105 Q50 90 60 105 Q50 120 40 105" fill="none" stroke="#667eea" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.5s" fill="freeze" />
        <animate attributeName="d" values="M40 105 Q50 90 60 105 Q50 120 40 105;M40 105 Q50 85 60 105 Q50 125 40 105;M40 105 Q50 90 60 105 Q50 120 40 105" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
      <path d="M140 105 Q150 90 160 105 Q150 120 140 105" fill="none" stroke="#667eea" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.5s" fill="freeze" />
        <animate attributeName="d" values="M140 105 Q150 90 160 105 Q150 120 140 105;M140 105 Q150 85 160 105 Q150 125 140 105;M140 105 Q150 90 160 105 Q150 120 140 105" dur="2s" begin="1s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

export function SceneNews() {
  return (
    <g>
      <rect x="50" y="55" width="100" height="90" rx="8" fill="#667eea" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
      </rect>
      <line x1="60" y1="70" x2="140" y2="70" stroke="white" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.5s" fill="freeze" />
      </line>
      <line x1="60" y1="85" x2="140" y2="85" stroke="white" strokeWidth="1" opacity="0.6">
        <animate attributeName="opacity" from="0" to="0.6" dur="0.3s" begin="0.7s" fill="freeze" />
      </line>
      <line x1="60" y1="95" x2="140" y2="95" stroke="white" strokeWidth="1" opacity="0.6">
        <animate attributeName="opacity" from="0" to="0.6" dur="0.3s" begin="0.9s" fill="freeze" />
      </line>
      <line x1="60" y1="105" x2="120" y2="105" stroke="white" strokeWidth="1" opacity="0.6">
        <animate attributeName="opacity" from="0" to="0.6" dur="0.3s" begin="1.1s" fill="freeze" />
      </line>
      <rect x="60" y="115" width="35" height="20" rx="4" fill="#764ba2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.3s" fill="freeze" />
      </rect>
      <rect x="105" y="115" width="35" height="20" rx="4" fill="#764ba2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.5s" fill="freeze" />
      </rect>
    </g>
  );
}

export function SceneFichiers() {
  return (
    <g>
      <rect x="70" y="60" width="80" height="90" rx="10" fill="#667eea" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
      </rect>
      <circle cx="95" cy="90" r="8" fill="white" opacity="0.9" />
      <polygon points="75,140 95,110 115,130 130,115 145,140" fill="white" opacity="0.7" />
      <rect x="30" y="130" width="40" height="40" rx="8" fill="#764ba2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.8s" fill="freeze" />
      </rect>
      <path d="M40 150 L40 160 L50 150 L50 160" fill="none" stroke="white" strokeWidth="2" />
      <path d="M45 148 L45 162" stroke="white" strokeWidth="2" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.3s" fill="freeze" />
      </path>
    </g>
  );
}

export function SceneAction() {
  return (
    <g>
      <circle cx="100" cy="100" r="55" fill="none" stroke="#667eea" strokeWidth="1" opacity="0">
        <animate attributeName="opacity" values="0;0.3;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="55;75;55" dur="2s" repeatCount="indefinite" />
      </circle>
      <rect x="60" y="75" width="80" height="55" rx="15" fill="url(#g1)">
        <animate attributeName="y" values="75;72;75" dur="2s" repeatCount="indefinite" />
      </rect>
      <circle cx="85" cy="102" r="4" fill="white" />
      <circle cx="100" cy="102" r="4" fill="white" />
      <circle cx="115" cy="102" r="4" fill="white" />
      <path d="M60 130 L50 150 L80 130" fill="url(#g1)" />
    </g>
  );
}
