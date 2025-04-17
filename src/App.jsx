import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

import "./App.css";

import logo from "./assets/logo.png";

const client = new ApolloClient({
  uri: "https://rickandmortyapi.com/graphql",
  cache: new InMemoryCache(),
});

const CHARACTERS_QUERY = gql`
  query GetCharacters($page: Int, $status: String, $species: String) {
    characters(page: $page, filter: { status: $status, species: $species }) {
      info {
        pages
        next
        prev
      }
      results {
        id
        name
        status
        species
        gender
        image
        origin {
          name
        }
      }
    }
  }
`;

const translations = {
  en: {
    name: "Name",
    status: "Status",
    species: "Species",
    gender: "Gender",
    origin: "Origin",
    loading: "Loading...",
    error: "An error occurred.",
    alive: "Alive",
    dead: "Dead",
    unknown: "Unknown",
  },
  de: {
    name: "Name",
    status: "Status",
    species: "Spezies",
    gender: "Geschlecht",
    origin: "Herkunft",
    loading: "Wird geladen...",
    error: "Ein Fehler ist aufgetreten.",
    alive: "Lebendig",
    dead: "Tot",
    unknown: "Unbekannt",
  },
};

function CharactersList({ language, setLanguage }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [species, setSpecies] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const { loading, error, data } = useQuery(CHARACTERS_QUERY, {
    variables: { page, status, species },
  });

  const t = translations[language];
  let characters = data?.characters?.results || [];

  const sortedCharacters = [...characters].sort((a, b) => {
    const aVal = sortBy === "name" ? a.name : a.origin.name;
    const bVal = sortBy === "name" ? b.name : b.origin.name;
    return aVal.localeCompare(bVal);
  });

  return (
    <div className="characters">
      <nav>
        <div className="logo">
          <img src={logo} alt="" />
        </div>
        <div className="filters">
          <input
            className="filter-style"
            placeholder={t.status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <input
            className="filter-style"
            placeholder={t.species}
            onChange={(e) => setSpecies(e.target.value)}
          />
          <select
            className="filter-style"
            onChange={(e) => setSortBy(e.target.value)}
            defaultValue="name"
          >
            <option value="name">Sort by name</option>
            <option value="origin">Sort by origin</option>
          </select>
        </div>
      </nav>

      {loading && <p className="loading">{t.loading}</p>}
      {error && <p className="error">{t.error}</p>}

      <div className="characters-container">
        <div className="characters-grid">
          {sortedCharacters.map((char) => (
            <div className="character-card" key={char.id}>
              <p>
                <strong>{t.name}:</strong> {char.name}
              </p>
              <img
                src={char.image}
                alt={char.name}
                className="character-image"
              />
              <p>
                <strong>{t.status}:</strong>{" "}
                {t[char.status.toLowerCase()] || t.unknown}
              </p>
              <p>
                <strong>{t.species}:</strong> {char.species}
              </p>
              <p>
                <strong>{t.gender}:</strong> {char.gender}
              </p>
              <p>
                <strong>{t.origin}:</strong> {char.origin.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <button
          className="filter-style"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!data?.characters?.info?.prev}
        >
          Previous
        </button>
        <button
          className="filter-style"
          onClick={() => setLanguage(language === "en" ? "de" : "en")}
        >
          Switch to {language === "en" ? "German" : "English"}
        </button>
        <button
          className="filter-style"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.characters?.info?.next}
        >
          Next
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState("en");

  return (
    <ApolloProvider client={client}>
      <CharactersList language={language} setLanguage={setLanguage} />
    </ApolloProvider>
  );
}
