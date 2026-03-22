package day068

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
