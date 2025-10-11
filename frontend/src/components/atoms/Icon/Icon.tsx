import React from 'react'
import { IconProps } from './Icon.types'

export const Icon: React.FC<IconProps> = ({
  name,
  className = '',
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const icons = {
    dashboard: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    exams: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
      >
        <path
          d="M22 10v6M2 10l10-5 10 5-10 5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 12v5c3 3 9 3 12 0v-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    students: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
      >
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    results: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
      >
        <path
          d="M18 20V10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 20V4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 20v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    certificates: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
      >
        <path
          d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="14,2 14,8 20,8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 13h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 17h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 21h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    search: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="80"
        height="80"
        viewBox="0 0 40 40"
      >
        <path
          fill="#b6c9d6"
          d="M3.499,38.5c-0.534,0-1.036-0.208-1.414-0.585S1.5,37.035,1.5,36.501s0.208-1.036,0.585-1.414 l18.233-17.382l1.983,1.985L4.904,37.923C4.535,38.292,4.033,38.5,3.499,38.5z"
        ></path>
        <path
          fill="#788b9c"
          d="M20.31,18.405l1.293,1.294L4.559,37.561C4.276,37.844,3.899,38,3.499,38 c-0.4,0-0.777-0.156-1.06-0.439c-0.584-0.584-0.584-1.535-0.017-2.103L20.31,18.405 M20.327,17.007L1.732,34.734 c-0.976,0.976-0.976,2.558,0,3.534v0C2.22,38.756,2.859,39,3.499,39c0.64,0,1.279-0.244,1.767-0.732L23,19.683L20.327,17.007 L20.327,17.007z"
        ></path>
        <g>
          <path
            fill="#d1edff"
            d="M26,26.5c-6.893,0-12.5-5.607-12.5-12.5S19.107,1.5,26,1.5S38.5,7.107,38.5,14S32.893,26.5,26,26.5z"
          ></path>
          <path
            fill="#788b9c"
            d="M26,2c6.617,0,12,5.383,12,12s-5.383,12-12,12s-12-5.383-12-12S19.383,2,26,2 M26,1 c-7.18,0-13,5.82-13,13c0,7.18,5.82,13,13,13s13-5.82,13-13C39,6.82,33.18,1,26,1L26,1z"
          ></path>
        </g>
      </svg>
    ),
    edit: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 21h4l11-11a1 1 0 0 0 0-1.41l-2.59-2.59a1 1 0 0 0-1.41 0L4 17v4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m12.5 6.5 3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    trash: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10 11v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 11v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    'chevron-down': (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    drag: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="5" r="1" fill="currentColor" />
        <circle cx="15" cy="5" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="19" r="1" fill="currentColor" />
        <circle cx="15" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
    ai: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 48 48"
      >
        <path
          fill="#2196f3"
          d="M23.426,31.911l-1.719,3.936c-0.661,1.513-2.754,1.513-3.415,0l-1.719-3.936	c-1.529-3.503-4.282-6.291-7.716-7.815l-4.73-2.1c-1.504-0.668-1.504-2.855,0-3.523l4.583-2.034	c3.522-1.563,6.324-4.455,7.827-8.077l1.741-4.195c0.646-1.557,2.797-1.557,3.443,0l1.741,4.195	c1.503,3.622,4.305,6.514,7.827,8.077l4.583,2.034c1.504,0.668,1.504,2.855,0,3.523l-4.73,2.1	C27.708,25.62,24.955,28.409,23.426,31.911z"
        ></path>
        <path
          fill="#7e57c2"
          d="M38.423,43.248l-0.493,1.131c-0.361,0.828-1.507,0.828-1.868,0l-0.493-1.131	c-0.879-2.016-2.464-3.621-4.44-4.5l-1.52-0.675c-0.822-0.365-0.822-1.56,0-1.925l1.435-0.638c2.027-0.901,3.64-2.565,4.504-4.65	l0.507-1.222c0.353-0.852,1.531-0.852,1.884,0l0.507,1.222c0.864,2.085,2.477,3.749,4.504,4.65l1.435,0.638	c0.822,0.365,0.822,1.56,0,1.925l-1.52,0.675C40.887,39.627,39.303,41.232,38.423,43.248z"
        ></path>
      </svg>
    ),
    save: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M11 2H9v3h2z" />
        <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
      </svg>
    ),
    courses: (
      <svg
        fill="#000000"
        height="16"
        width="16"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 297 297"
      >
        <g>
          <path
            d="M0,282.298c0,5.458,4.426,9.884,9.884,9.884h277.232c5.458,0,9.884-4.426,9.884-9.884V14.701
		c0-5.457-4.426-9.883-9.884-9.883H9.884C4.426,4.818,0,9.244,0,14.701V282.298z M19.767,24.585h257.467v159.619H142.075v-34.923
		l37.929-37.623c1.866-1.851,2.918-4.368,2.923-6.996c0.005-2.628-1.036-5.15-2.895-7.01l-0.271-0.271l56.209-42.156
		c4.366-3.275,5.251-9.471,1.977-13.838c-3.275-4.366-9.47-5.251-13.838-1.977l-58.468,43.85l-1.916-1.916
		c-3.193-3.191-8.145-3.814-12.028-1.513L131.977,91.52c1.047-3.686,1.619-7.569,1.619-11.587c0-23.434-19.065-42.499-42.499-42.499
		c-23.435,0-42.499,19.065-42.499,42.499c0,9.72,3.287,18.681,8.797,25.849c-9.714,8.48-12.344,21.346-13.412,26.588
		c-2.775,13.617-3.153,31.365-3.205,51.835H19.767V24.585z M91.098,102.665c-12.535,0-22.732-10.197-22.732-22.732
		c0-12.534,10.197-22.731,22.732-22.731c12.534,0,22.731,10.197,22.731,22.731C113.829,92.468,103.632,102.665,91.098,102.665z
		 M63.352,136.316c1.406-6.9,3.288-11.186,5.417-13.885h47.115c1.772,0,3.514-0.477,5.039-1.381l34.25-20.302l3.864,3.864
		l-33.806,33.534c-1.872,1.856-2.924,4.382-2.924,7.017v39.04H60.544C60.594,164.825,60.938,148.16,63.352,136.316z
		 M277.233,203.971v68.444H19.767v-68.444H277.233z"
          />
          <path
            d="M258.003,227.197H80.115v-3.041c0-5.458-4.425-9.884-9.884-9.884c-5.458,0-9.883,4.426-9.883,9.884v3.041H38.994
		c-5.458,0-9.883,4.426-9.883,9.884c0,5.458,4.425,9.884,9.883,9.884h21.354v3.041c0,5.458,4.425,9.884,9.883,9.884
		c5.459,0,9.884-4.426,9.884-9.884v-3.041h177.888c5.459,0,9.884-4.426,9.884-9.884
		C267.887,231.623,263.462,227.197,258.003,227.197z"
          />
        </g>
      </svg>
    )
  }

  return icons[name] || null
}
