import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressBar, Button, Modal, Badge, Skeleton } from "../../components/ui";
import QuestionCard from "../../components/QuestionCard";

// ─── ProgressBar ─────────────────────────────────────────

describe("ProgressBar", () => {
  it("renders with correct aria values", () => {
    render(<ProgressBar value={60} label="Score" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps value to 0–100", () => {
    render(<ProgressBar value={150} />);
    const fill = document.querySelector("[style]") as HTMLElement;
    expect(fill?.style.width).toBe("100%");
  });

  it("shows label and percentage text", () => {
    render(<ProgressBar value={42} label="Progress" />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });
});

// ─── Button ──────────────────────────────────────────────

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when loading", () => {
    render(<Button loading>Saving…</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders danger variant with appropriate class", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-600");
  });
});

// ─── Badge ───────────────────────────────────────────────

describe("Badge", () => {
  it("renders content", () => {
    render(<Badge>ADMIN</Badge>);
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("applies blue variant class by default", () => {
    render(<Badge>Blue</Badge>);
    expect(screen.getByText("Blue")).toHaveClass("bg-primary-100");
  });

  it("applies danger variant class", () => {
    render(<Badge variant="red">Error</Badge>);
    expect(screen.getByText("Error")).toHaveClass("bg-red-100");
  });
});

// ─── Modal ───────────────────────────────────────────────

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(
      <Modal open onClose={jest.fn()} title="My Dialog">
        <p>Modal body</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Closeable">
        <p>Content</p>
      </Modal>
    );
    await user.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Backdrop">
        <p>Content</p>
      </Modal>
    );
    // Click backdrop (aria-hidden div)
    const backdrop = document.querySelector("[aria-hidden='true']") as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── QuestionCard ─────────────────────────────────────────

describe("QuestionCard", () => {
  const mcqQuestion = {
    id: "q-1",
    order: 1,
    type: "MCQ" as const,
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    marks: 1,
  };

  const saQuestion = {
    id: "q-2",
    order: 2,
    type: "SHORT_ANSWER" as const,
    text: "Describe photosynthesis.",
    options: null,
    marks: 3,
  };

  it("renders MCQ question text", () => {
    render(
      <QuestionCard
        question={mcqQuestion}
        answer={undefined}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
  });

  it("renders all MCQ options as radio buttons", () => {
    render(
      <QuestionCard
        question={mcqQuestion}
        answer={undefined}
        onChange={jest.fn()}
      />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls onChange when option selected", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <QuestionCard
        question={mcqQuestion}
        answer={undefined}
        onChange={onChange}
      />
    );
    await user.click(screen.getByLabelText("4"));
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("renders SHORT_ANSWER as textarea", () => {
    render(
      <QuestionCard
        question={saQuestion}
        answer=""
        onChange={jest.fn()}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("disables inputs in showResult mode", () => {
    render(
      <QuestionCard
        question={mcqQuestion}
        answer="1"
        onChange={jest.fn()}
        showResult
        correctAnswer="1"
      />
    );
    const radios = screen.getAllByRole("radio");
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it("shows correct answer indicator in result mode", () => {
    render(
      <QuestionCard
        question={mcqQuestion}
        answer="1"
        onChange={jest.fn()}
        showResult
        correctAnswer="1"
      />
    );
    expect(screen.getByText("✓ Correct")).toBeInTheDocument();
  });

  it("shows wrong answer indicator when incorrect", () => {
    render(
      <QuestionCard
        question={mcqQuestion}
        answer="0"
        onChange={jest.fn()}
        showResult
        correctAnswer="1"
      />
    );
    expect(screen.getByText("✗ Wrong")).toBeInTheDocument();
  });
});

// ─── Skeleton ─────────────────────────────────────────────

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    render(<Skeleton className="h-8 w-32" />);
    const el = document.querySelector(".animate-pulse");
    expect(el).toBeInTheDocument();
  });

  it("is hidden from screen readers", () => {
    render(<Skeleton />);
    const el = document.querySelector("[aria-hidden='true']");
    expect(el).toBeInTheDocument();
  });
});
