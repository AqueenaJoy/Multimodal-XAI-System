import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);

    // Reset form
    setForm({ name: "", email: "", message: "" });

    // Later we connect this to Flask API
  };

  return (
    <section className="section contact">
      <h2>Contact</h2>
      <p>Feel free to reach out for collaboration or research discussion.</p>

      <div className="contact-card">
        <p><strong>Name:</strong> Aqueena Joy</p>
        <p><strong>Email:</strong> joyaqueena@email.com</p>
        <p><strong>Phone:</strong> +91 1234567890</p>
      </div>

      <div className="contact-form">
        <h3>Send a Message</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <textarea
              name="message"
              placeholder="Your Message..."
              value={form.message}
              onChange={handleChange}
              required
              className="form-textarea"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>

        {sent && (
          <p style={{ marginTop: "1rem", color: "#10b981" }}>
            ✔ Message sent successfully.
          </p>
        )}
      </div>
    </section>
  );
}

export default Contact;