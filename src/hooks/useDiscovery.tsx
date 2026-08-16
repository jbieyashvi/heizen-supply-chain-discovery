import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clioQuestions,
  discoveryMeta,
  type Completeness,
  type DiscoveryQuestion,
  type EvidenceStrength,
  type QOutcome,
  type QPriority,
} from "../data/discovery";

export interface FollowUp {
  id: string;
  text: string;
  asked: boolean;
  answer: string;
}
export interface Answer {
  text: string;
  keyFacts: string;
  strength: EvidenceStrength | null;
  completeness: Completeness | null;
  followUpRequired: boolean;
  note: string;
  round: number | null;
  followUps: FollowUp[];
}
interface QState {
  shortlisted: boolean;
  outcome: QOutcome;
  answer: Answer;
}

export type AugmentedQuestion = DiscoveryQuestion & QState;

export type SortMode = "recommended" | "priority" | "custom";

const emptyAnswer = (): Answer => ({
  text: "",
  keyFacts: "",
  strength: null,
  completeness: null,
  followUpRequired: false,
  note: "",
  round: null,
  followUps: [],
});

/** True when the consultant has entered any content for a question. */
export function hasAnswerContent(a: Answer): boolean {
  return Boolean(
    a.text.trim() ||
      a.keyFacts.trim() ||
      a.note.trim() ||
      a.completeness ||
      a.strength ||
      a.followUps.length
  );
}

const priorityRank: Record<QPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
};

interface DiscoveryCtx {
  round: number;
  questions: AugmentedQuestion[];
  shortlisted: AugmentedQuestion[]; // ordered by sortMode
  sortMode: SortMode;
  callStartId: string | null;
  /** Introductory-call question shortlist (broad question set). */
  introShortlist: Record<string, boolean>;
  toggleIntroShortlist: (id: string) => void;
  get: (id: string) => AugmentedQuestion | undefined;
  toggleShortlist: (id: string) => void;
  setOutcome: (id: string, outcome: QOutcome) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  setSortMode: (m: SortMode) => void;
  saveAnswer: (id: string, patch: Partial<Answer>) => void;
  resetAnswer: (id: string) => void;
  addFollowUp: (id: string, text: string) => string;
  setFollowUp: (id: string, fuId: string, patch: Partial<FollowUp>) => void;
  setCallStart: (id: string | null) => void;
}

const Ctx = createContext<DiscoveryCtx | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, QState>>(() => {
    const init: Record<string, QState> = {};
    clioQuestions.forEach((q) => {
      init[q.id] = {
        shortlisted: q.shortlisted,
        outcome: null,
        answer: emptyAnswer(),
      };
    });
    return init;
  });
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [customOrder, setCustomOrder] = useState<string[]>(() =>
    clioQuestions
      .filter((q) => q.shortlisted)
      .sort((a, b) => a.recommendedIndex - b.recommendedIndex)
      .map((q) => q.id)
  );
  const [callStartId, setCallStart] = useState<string | null>(null);
  const [fuSeq, setFuSeq] = useState(0);
  const [introShortlist, setIntroShortlist] = useState<Record<string, boolean>>(
    {}
  );

  const toggleIntroShortlist = useCallback((id: string) => {
    setIntroShortlist((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const questions = useMemo<AugmentedQuestion[]>(
    () => clioQuestions.map((q) => ({ ...q, ...states[q.id] })),
    [states]
  );

  const get = useCallback(
    (id: string) => questions.find((q) => q.id === id),
    [questions]
  );

  const shortlisted = useMemo<AugmentedQuestion[]>(() => {
    const list = questions.filter((q) => q.shortlisted);
    if (sortMode === "priority") {
      return [...list].sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          a.recommendedIndex - b.recommendedIndex
      );
    }
    if (sortMode === "custom") {
      const idx = (id: string) => {
        const i = customOrder.indexOf(id);
        return i === -1 ? 999 : i;
      };
      return [...list].sort((a, b) => idx(a.id) - idx(b.id));
    }
    return [...list].sort((a, b) => a.recommendedIndex - b.recommendedIndex);
  }, [questions, sortMode, customOrder]);

  const toggleShortlist = useCallback((id: string) => {
    setStates((s) => {
      const cur = s[id];
      const next = !cur.shortlisted;
      return {
        ...s,
        [id]: {
          ...cur,
          shortlisted: next,
          // re-shortlisting clears a not-relevant outcome
          outcome: next && cur.outcome === "not-relevant" ? null : cur.outcome,
        },
      };
    });
    setCustomOrder((o) =>
      o.includes(id) ? o.filter((x) => x !== id) : [...o, id]
    );
  }, []);

  const setOutcome = useCallback((id: string, outcome: QOutcome) => {
    setStates((s) => ({
      ...s,
      [id]: {
        ...s[id],
        outcome,
        // dropping from the call also removes it from the shortlist
        shortlisted: outcome === "not-relevant" ? false : s[id].shortlisted,
      },
    }));
    if (outcome === "not-relevant") {
      setCustomOrder((o) => o.filter((x) => x !== id));
    }
  }, []);

  const move = useCallback(
    (id: string, dir: -1 | 1) => {
      setSortMode("custom");
      setCustomOrder((prev) => {
        // ensure the order array reflects the currently shortlisted ids
        const base = prev.filter((x) => states[x]?.shortlisted);
        const i = base.indexOf(id);
        if (i === -1) return prev;
        const j = i + dir;
        if (j < 0 || j >= base.length) return prev;
        const next = [...base];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });
    },
    [states]
  );
  const moveUp = useCallback((id: string) => move(id, -1), [move]);
  const moveDown = useCallback((id: string) => move(id, 1), [move]);

  const saveAnswer = useCallback((id: string, patch: Partial<Answer>) => {
    setStates((s) => ({
      ...s,
      [id]: { ...s[id], answer: { ...s[id].answer, ...patch } },
    }));
  }, []);

  const resetAnswer = useCallback((id: string) => {
    setStates((s) => ({
      ...s,
      [id]: { ...s[id], outcome: null, answer: emptyAnswer() },
    }));
  }, []);

  const addFollowUp = useCallback(
    (id: string, text: string) => {
      const fuId = `fu-${id}-${fuSeq}`;
      setFuSeq((n) => n + 1);
      setStates((s) => ({
        ...s,
        [id]: {
          ...s[id],
          answer: {
            ...s[id].answer,
            followUps: [
              ...s[id].answer.followUps,
              { id: fuId, text, asked: false, answer: "" },
            ],
          },
        },
      }));
      return fuId;
    },
    [fuSeq]
  );

  const setFollowUp = useCallback(
    (id: string, fuId: string, patch: Partial<FollowUp>) => {
      setStates((s) => ({
        ...s,
        [id]: {
          ...s[id],
          answer: {
            ...s[id].answer,
            followUps: s[id].answer.followUps.map((f) =>
              f.id === fuId ? { ...f, ...patch } : f
            ),
          },
        },
      }));
    },
    []
  );

  const value: DiscoveryCtx = {
    round: discoveryMeta.round,
    questions,
    shortlisted,
    sortMode,
    callStartId,
    introShortlist,
    toggleIntroShortlist,
    get,
    toggleShortlist,
    setOutcome,
    moveUp,
    moveDown,
    setSortMode,
    saveAnswer,
    resetAnswer,
    addFollowUp,
    setFollowUp,
    setCallStart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDiscovery() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiscovery must be used within DiscoveryProvider");
  return ctx;
}
