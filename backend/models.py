from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    aircraft = Column(String(120), nullable=False)
    location = Column(String(160), nullable=False)
    flight_phase = Column(String(80), nullable=False)
    year = Column(Integer, nullable=False)
    dossier = Column(Text, nullable=False)

    causal_chain = relationship(
        "CausalFactor",
        back_populates="accident",
        cascade="all, delete-orphan",
        order_by="CausalFactor.sort_order",
    )
    clues = relationship(
        "Clue",
        back_populates="accident",
        cascade="all, delete-orphan",
        order_by="Clue.sort_order",
    )
    historical_cases = relationship(
        "HistoricalCase",
        back_populates="accident",
        cascade="all, delete-orphan",
        order_by="HistoricalCase.sort_order",
    )


class CausalFactor(Base):
    __tablename__ = "causal_factors"

    id = Column(Integer, primary_key=True, index=True)
    accident_id = Column(Integer, ForeignKey("accidents.id"), nullable=False)
    factor = Column(String(120), nullable=False)
    impact = Column(String(180), nullable=False)
    result = Column(String(180), nullable=False)
    explanation = Column(Text, nullable=False)
    severity = Column(String(40), nullable=False, default="关键")
    sort_order = Column(Integer, nullable=False, default=0)

    accident = relationship("Accident", back_populates="causal_chain")


class Clue(Base):
    __tablename__ = "clues"

    id = Column(Integer, primary_key=True, index=True)
    accident_id = Column(Integer, ForeignKey("accidents.id"), nullable=False)
    type = Column(String(40), nullable=False)
    title = Column(String(140), nullable=False)
    content = Column(Text, nullable=False)
    detail = Column(Text, nullable=False)
    related_factor = Column(String(120), nullable=True)
    reliability = Column(String(40), nullable=False, default="高")
    sort_order = Column(Integer, nullable=False, default=0)

    accident = relationship("Accident", back_populates="clues")


class HistoricalCase(Base):
    __tablename__ = "historical_cases"

    id = Column(Integer, primary_key=True, index=True)
    accident_id = Column(Integer, ForeignKey("accidents.id"), nullable=False)
    trigger_factor = Column(String(120), nullable=False)
    title = Column(String(160), nullable=False)
    content = Column(Text, nullable=False)
    lesson = Column(Text, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    accident = relationship("Accident", back_populates="historical_cases")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    accident_id = Column(Integer, ForeignKey("accidents.id"), nullable=False)
    selected_factors = Column(Text, nullable=False)
    report_text = Column(Text, nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
