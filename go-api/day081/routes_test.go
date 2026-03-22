package day081

import "testing"

func TestCleanGeminiJSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		in   string
		want string
	}{
		{
			name: "plain json",
			in:   `{"summary":"a","tags":["x"]}`,
			want: `{"summary":"a","tags":["x"]}`,
		},
		{
			name: "json code fence",
			in:   "```json\n{\"summary\":\"a\",\"tags\":[\"x\"]}\n```",
			want: `{"summary":"a","tags":["x"]}`,
		},
		{
			name: "generic code fence",
			in:   "```\n{\"summary\":\"a\",\"tags\":[\"x\"]}\n```",
			want: `{"summary":"a","tags":["x"]}`,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := cleanGeminiJSON(tt.in); got != tt.want {
				t.Fatalf("cleanGeminiJSON() = %q, want %q", got, tt.want)
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
