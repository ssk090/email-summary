interface SummaryCardProps {
    id: string;
    subject: string;
    from: string;
    summary: string;
    company: string | null;
    jobRole: string | null;
    deadline: string | null;
    createdAt: string;
}

export default function SummaryCard({
    subject,
    from,
    summary,
    company,
    jobRole,
    deadline,
}: SummaryCardProps) {
    return (
        <div className="card animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-3">
                {company && <span className="badge badge-primary">{company}</span>}
                {jobRole && <span className="badge badge-success">{jobRole}</span>}
                {deadline && <span className="badge badge-warning">📅 {deadline}</span>}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                {subject}
            </h3>

            <p className="text-sm text-muted mb-3 line-clamp-1">{from}</p>

            <p className="text-foreground leading-relaxed">{summary}</p>

            <div className="mt-4 pt-4 border-t border-border">
                <a
                    href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(subject)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                >
                    View in Gmail
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
}
