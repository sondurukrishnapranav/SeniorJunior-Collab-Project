import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const members = [
  {
    name: "Alice Johnson",
    role: "Senior Developer",
    skills: "React, Node.js, MongoDB",
    img: "",
  },
  {
    name: "Rahul Verma",
    role: "Junior Developer",
    skills: "Python, Machine Learning",
    img: "",
  },
  {
    name: "Sofia Lee",
    role: "UI/UX Designer",
    skills: "Figma, Adobe XD, CSS",
    img: "",
  },
  {
    name: "David Kim",
    role: "Senior AI Engineer",
    skills: "Deep Learning, TensorFlow, NLP",
    img: "",
  },
];

function Community() {
  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">👥 Community Members</h2>
      <Row>
        {members.map((member, index) => (
          <Col md={3} sm={6} key={index} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={member.img}
                alt={member.name}
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{member.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {member.role}
                </Card.Subtitle>
                <Card.Text>
                  <strong>Skills:</strong> {member.skills}
                </Card.Text>
                <Button variant="primary" size="sm">
                  View Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Community;
