package day081

import "testing"

func TestCleanGeminiMarkdown(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		in   string
		want string
	}{
		{
			name: "plain markdown",
			in:   "## 要約\n本文",
			want: "## 要約\n本文",
		},
		{
			name: "markdown code fence",
			in:   "```markdown\n## 要約\n本文\n```",
			want: "## 要約\n本文",
		},
		{
			name: "generic code fence",
			in:   "```\n## 要約\n本文\n```",
			want: "## 要約\n本文",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := cleanGeminiMarkdown(tt.in); got != tt.want {
				t.Fatalf("cleanGeminiMarkdown() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestSanitizeSRT(t *testing.T) {
	t.Parallel()

	in := "1\n00:00:00,000 --> 00:00:01,000\nこんにちは\n\n2\n00:00:01,500 --> 00:00:03,000\n世界\n"
	want := "こんにちは 世界"

	if got := sanitizeSRT(in); got != want {
		t.Fatalf("sanitizeSRT() = %q, want %q", got, want)
	}
}

func TestLimitRunes(t *testing.T) {
	t.Parallel()

	if got := limitRunes("abcdef", 4); got != "abcd..." {
		t.Fatalf("limitRunes() = %q, want %q", got, "abcd...")
	}
}
