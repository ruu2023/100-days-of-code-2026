package main

import (
	"fmt"
	"os"
	"time"

	"github.com/charmbracelet/bubbles/progress"
	"github.com/charmbracelet/bubbles/timer"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const (
	workTime       = 25 * time.Minute
	shortBreakTime = 5 * time.Minute
	longBreakTime  = 15 * time.Minute
)

type model struct {
	timer    timer.Model
	progress progress.Model
	mode     string // "Work", "Short Break", "Long Break"
	quitting bool
}

func (m model) Init() tea.Cmd {
	return m.timer.Init()
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			m.quitting = true
			return m, tea.Quit
		case "r":
			m.timer.Stop()
			// Reset based on current mode defaults, effectively restarting
			var timeout time.Duration
			switch m.mode {
			case "Work":
				timeout = workTime
			case "Short Break":
				timeout = shortBreakTime
			case "Long Break":
				timeout = longBreakTime
			}
			m.timer = timer.NewWithInterval(timeout, time.Second)
			return m, m.timer.Init()
		case "w":
			m.mode = "Work"
			m.timer = timer.NewWithInterval(workTime, time.Second)
			return m, m.timer.Init()
		case "s":
			m.mode = "Short Break"
			m.timer = timer.NewWithInterval(shortBreakTime, time.Second)
			return m, m.timer.Init()
		case "l":
			m.mode = "Long Break"
			m.timer = timer.NewWithInterval(longBreakTime, time.Second)
			return m, m.timer.Init()
		case " ":
			return m, m.timer.Toggle()
		}
	case timer.TickMsg:
		var cmd tea.Cmd
		m.timer, cmd = m.timer.Update(msg)
		return m, cmd
	case timer.StartStopMsg:
		var cmd tea.Cmd
		m.timer, cmd = m.timer.Update(msg)
		return m, cmd
	case timer.TimeoutMsg:
		m.quitting = true
		return m, tea.Quit
	case progress.FrameMsg:
		progressModel, cmd := m.progress.Update(msg)
		m.progress = progressModel.(progress.Model)
		return m, cmd
	}
	return m, nil
}

func (m model) View() string {
	if m.quitting {
		return "Done!\n"
	}

	// Styles
	boldStyle := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("5"))
	infoStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("241"))
	timerStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("3")).Margin(1, 0)

	// Content
	s := "\n"
	s += boldStyle.Render("🍅 Pomodoro Timer") + "\n\n"
	s += fmt.Sprintf("Mode: %s\n", m.mode)
	
	// Format timer
	t := m.timer.Timeout
	min := int(t.Minutes())
	sec := int(t.Seconds()) % 60
	s += timerStyle.Render(fmt.Sprintf("%02d:%02d", min, sec)) + "\n\n"

	// Help text
	s += infoStyle.Render("Controls:") + "\n"
	s += infoStyle.Render("[Space] Start/Pause  [r] Reset") + "\n"
	s += infoStyle.Render("[w] Work  [s] Short Break  [l] Long Break") + "\n"
	s += infoStyle.Render("[q] Quit") + "\n"

	return s
}

func main() {
	m := model{
		timer:    timer.NewWithInterval(workTime, time.Second),
		progress: progress.New(progress.WithDefaultGradient()),
		mode:     "Work",
	}

	if _, err := tea.NewProgram(m).Run(); err != nil {
		fmt.Println("Error running program:", err)
		os.Exit(1)
	}
}
