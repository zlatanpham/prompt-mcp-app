"use client";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { api } from "../../../trpc/react";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextValue {
  organization: Organization | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined,
);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { data, isLoading } =
    api.organization.getOwnedOrganization.useQuery(undefined);

  React.useEffect(() => {
    if (data) {
      setOrganization({ id: data.id, name: data.name });
    }
  }, [data]);

  return React.createElement(
    OrganizationContext.Provider,
    { value: { organization, loading: isLoading } },
    children,
  );
};

export const useOrganization = (): OrganizationContextValue => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  }
  return context;
};
