import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* AI Brain/Note Icon */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6zm1-1.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
                fill="currentColor"
            />
            {/* Note/Text Lines */}
            <path
                d="M8 14h6v1.5H8V14zm0-2h8v1.5H8V12zm0-2h4v1.5H8V10z"
                fill="currentColor"
                opacity="0.7"
            />
        </svg>
    );
}
