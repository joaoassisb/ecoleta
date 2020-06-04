import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";

import logo from "../../assets/logo.svg";
import "./styles.css";
import api from "../../services/api";

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

interface IbgeUfResponse {
  sigla: string;
}

interface IbgeCitiesResponse {
  nome: string;
}

const CreatePoint = () => {
  const history = useHistory();

  const [items, setItems] = useState<ItemProps[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [selectedUf, selectUf] = useState<string>("");
  const [selectedCity, selectCity] = useState<string>("");
  const [selectedItems, selectItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("/items").then(({ data }) => {
      setItems(data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IbgeUfResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
      .then(({ data }) => {
        const ufsInitials = data.map(({ sigla }) => sigla);

        setUfs(ufsInitials);
      });
  });

  useEffect(() => {
    if (selectedUf) {
      axios
        .get<IbgeCitiesResponse[]>(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
        )
        .then(({ data }) => {
          const citiesNames = data.map(({ nome }) => nome);

          setCities(citiesNames);
        });
    }
  }, [selectedUf]);

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { target } = event;

    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  }

  function handleSelectItem(itemId: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === itemId);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== itemId);
      selectItems(filteredItems);
    } else {
      selectItems([...selectedItems, itemId]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    await api.post("/points", data);
    alert("Ponto de coleta criado");
    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft></FiArrowLeft>Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o Endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                id="uf"
                name="uf"
                onChange={(e) => selectUf(e.target.value)}
                value={selectedUf}
              >
                <option value="">Selecione uma UF</option>
                {ufs.map((uf, index) => (
                  <option key={index} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                id="city"
                name="city"
                onChange={(e) => selectCity(e.target.value)}
                value={selectedCity}
              >
                <option value="">Selecione uma cidade</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens</h2>
            <span>Selecione um ou mais itens abaixo </span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt="" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
