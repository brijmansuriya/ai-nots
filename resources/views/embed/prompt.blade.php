<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #111827;
            --border-color: #e5e7eb;
            --secondary-text: #4b5563;
            --accent-color: #000000;
            --accent-text: #ffffff;
            --code-bg: #f9fafb;
        }

        .dark {
            --bg-color: #030712;
            --text-color: #f3f4f6;
            --border-color: #1f2937;
            --secondary-text: #9ca3af;
            --accent-color: #ffffff;
            --accent-text: #030712;
            --code-bg: #111827;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: transparent;
        }

        .ainots-embed {
            max-width: 600px;
            margin: 0 auto;
            background: var(--bg-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            transition: all 0.2s;
        }

        .embed-header {
            padding: 16px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .embed-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .embed-content {
            padding: 16px;
        }

        .embed-description {
            font-size: 14px;
            color: var(--secondary-text);
            margin-bottom: 12px;
            line-height: 1.5;
        }

        .prompt-box {
            background: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            position: relative;
        }

        .prompt-text {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.6;
        }

        .embed-footer {
            padding: 12px 16px;
            background: var(--code-bg);
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            flex-wrap: wrap;
        }

        .tags-list {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .tag-pill {
            font-size: 11px;
            background: var(--accent-color);
            color: var(--accent-text);
            padding: 2px 8px;
            border-radius: 9999px;
            font-weight: 500;
        }

        .actions {
            display: flex;
            gap: 8px;
        }

        .btn {
            appearance: none;
            background: var(--accent-color);
            color: var(--accent-text);
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: opacity 0.2s;
        }

        .btn:hover {
            opacity: 0.8;
        }

        .btn-outline {
            background: transparent;
            color: var(--text-color);
            border: 1px solid var(--border-color);
        }

        .btn-outline:hover {
            background: var(--border-color);
            opacity: 1;
        }

        .copy-success {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #10b981;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }

        .show-success {
            opacity: 1;
        }
    </style>
</head>

<body class="{{ $theme === 'dark' ? 'dark' : '' }}">
    <div class="ainots-embed">
        <div class="embed-header">
            <h3 class="embed-title">{{ $prompt->title }}</h3>
            <div class="actions">
                <button class="btn" onclick="copyPrompt(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copy
                </button>
            </div>
        </div>
        <div class="embed-content">
            @if($prompt->description)
                <div class="embed-description">{{ $prompt->description }}</div>
            @endif
            <div class="prompt-box">
                <pre class="prompt-text" id="prompt-{{ $prompt->id }}">{{ $prompt->prompt }}</pre>
                <div class="copy-success" id="success-{{ $prompt->id }}">Copied!</div>
            </div>
        </div>
        <div class="embed-footer">
            <div class="tags-list">
                @foreach($prompt->tags as $tag)
                    <span class="tag-pill">{{ $tag->name }}</span>
                @endforeach
            </div>
            <div class="actions">
                <a href="{{ route('embed.json', $prompt->id) }}" class="btn btn-outline" title="Download JSON">JSON</a>
                <a href="{{ route('embed.markdown', $prompt->id) }}" class="btn btn-outline"
                    title="Download Markdown">MD</a>
                <a href="{{ route('embed.text', $prompt->id) }}" class="btn btn-outline" title="Download Text">TXT</a>
            </div>
        </div>
    </div>

    <script>
        function copyPrompt(btn) {
            const text = document.getElementById('prompt-{{ $prompt->id }}').innerText;
            const success = document.getElementById('success-{{ $prompt->id }}');

            navigator.clipboard.writeText(text).then(() => {
                success.classList.add('show-success');
                setTimeout(() => {
                    success.classList.remove('show-success');
                }, 2000);
            });
        }
    </script>
</body>

</html>