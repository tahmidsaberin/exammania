import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    query: {},
    pathname: "/",
    asPath: "/",
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: jest.fn(),
  toast: jest.fn(),
  Toaster: () => null,
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
          key
        );
      }
      return key;
    },
    i18n: {
      language: "en",
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: { type: "3rdParty", init: jest.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  mutate: jest.fn(),
}));
