import { FormData } from '../types';

interface ContactSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
}

export function ContactSection(props: ContactSectionProps) {
  return (
    <div class="form-section">
      <h3>
        Contacto
        <span class="tooltip" tabindex="0" aria-describedby="tt-contact">
          <span class="tooltip-icon" aria-hidden="true">i</span>
          <span id="tt-contact" class="tooltip-text" role="tooltip">
            Añade extensiones y móviles; activa WhatsApp/Telegram si aplica.
          </span>
        </span>
      </h3>
      <div class="form-row data-fields">
        <label class="label-10" for="extension">Ext.:</label>
        <input
          type="text"
          id="extension"
          class="input-35"
          placeholder="Ingresa Anexo"
          title="Extensión del teléfono; opcional"
          value={props.formData.extension}
          onInput={(e) => props.onChange('extension', e.currentTarget.value)}
        />
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="mobile">Móvil:</label>
        <input
          type="text"
          id="mobile"
          class="input-35"
          placeholder="Ingresa Número Celular"
          title="Número móvil; puedes activar WhatsApp/Telegram"
          value={props.formData.mobile}
          onInput={(e) => props.onChange('mobile', e.currentTarget.value)}
        />
        <div class="checkbox-group">
          <div class="checkbox-pair">
            <input
              type="checkbox"
              id="add-whatsapp"
              title="Añadir WhatsApp"
              checked={props.formData.addWhatsapp}
              onChange={(e) => props.onChange('addWhatsapp', e.currentTarget.checked)}
            />
            <label for="add-whatsapp">Wsp</label>
          </div>
          <div class="checkbox-pair">
            <input
              type="checkbox"
              id="add-telegram"
              title="Añadir Telegram"
              checked={props.formData.addTelegram}
              onChange={(e) => props.onChange('addTelegram', e.currentTarget.checked)}
            />
            <label for="add-telegram">Tlg</label>
          </div>
        </div>
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="address">Dirección:</label>
        <textarea
          id="address"
          class="input-35"
          rows="2"
          placeholder="Av. Los Frutales 419. Urb. El Artesano Ate. Lima – Perú"
          title="Dirección de la empresa; se muestra con el pin de ubicación"
          value={props.formData.address}
          onInput={(e) => props.onChange('address', e.currentTarget.value)}
        />
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="addressMapUrl">Maps:</label>
        <input
          type="text"
          id="addressMapUrl"
          class="input-35"
          placeholder="Link de Google Maps"
          title="URL de Google Maps para la dirección"
          value={props.formData.addressMapUrl}
          onInput={(e) => props.onChange('addressMapUrl', e.currentTarget.value)}
        />
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="mobile2">Móvil 2:</label>
        <input
          type="text"
          id="mobile2"
          class="input-35"
          placeholder="Número Alternativo"
          title="Número móvil alternativo; opcional"
          value={props.formData.mobile2}
          onInput={(e) => props.onChange('mobile2', e.currentTarget.value)}
        />
        <div class="checkbox-group">
          <div class="checkbox-pair">
            <input
              type="checkbox"
              id="add-whatsapp2"
              title="Añadir WhatsApp 2"
              checked={props.formData.addWhatsapp2}
              onChange={(e) => props.onChange('addWhatsapp2', e.currentTarget.checked)}
            />
            <label for="add-whatsapp2">Wsp</label>
          </div>
        </div>
      </div>
    </div>
  );
}