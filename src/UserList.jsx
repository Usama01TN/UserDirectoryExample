import { useEffect, useState } from "react";
import axios from "axios";
import "./UserList.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

function initials(name) {
  return name
    .split(" ")
    .filter((part) => !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function UserList() {
  const [listOfUsers, setListOfUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [attempt, setAttempt] = useState(0); // bump to re-run the request

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(API_URL, { signal: controller.signal })
      .then((response) => {
        setListOfUsers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return; // component unmounted / effect re-ran
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const visibleUsers = listOfUsers.filter((user) =>
    user.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  };

  const toggleUser = (id) =>
    setSelectedId((current) => (current === id ? null : id));

  if (loading) {
    return (
      <main className="directory">
        <p className="status" role="status">Loading users...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="directory">
        <div className="status status-error" role="alert">
          <p>Could not load users: {error}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="directory">
      <header className="directory-header">
        <h1>People</h1>
        <p className="count">
          {visibleUsers.length} of {listOfUsers.length} shown
        </p>
      </header>

      <input
        className="search"
        type="search"
        placeholder="Search by name"
        aria-label="Search users by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visibleUsers.length === 0 ? (
        <p className="status">No one matches “{search}”. Try a shorter name.</p>
      ) : (
        <ul className="users">
          {visibleUsers.map((user) => {
            const isOpen = selectedId === user.id;
            return (
              <li key={user.id} className={isOpen ? "user open" : "user"}>
                <button
                  type="button"
                  className="user-summary"
                  aria-expanded={isOpen}
                  aria-controls={`details-${user.id}`}
                  onClick={() => toggleUser(user.id)}
                >
                  <span className="tab" aria-hidden="true">
                    {initials(user.name)}
                  </span>
                  <span className="who">
                    <span className="name">{user.name}</span>
                    <span className="email">{user.email}</span>
                  </span>
                  <span className="company">{user.company.name}</span>
                </button>

                <div className="details-wrap" id={`details-${user.id}`}>
                  <dl className="details">
                    <div>
                      <dt>Address</dt>
                      <dd>
                        {user.address.suite}, {user.address.street}
                        <br />
                        {user.address.city} {user.address.zipcode}
                      </dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{user.phone}</dd>
                    </div>
                    <div>
                      <dt>Website</dt>
                      <dd>{user.website}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
