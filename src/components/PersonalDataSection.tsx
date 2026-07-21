import { FormData } from '../types';

interface PersonalDataSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | number) => void;
  errors: Record<string, string>;
}

export function PersonalDataSection(props: PersonalDataSectionProps) {
  return (
    <div class="form-section">
      <h3>
        Datos Personales
        <span class="tooltip" tabindex="0" aria-describedby="tt-personal">
          <span class="tooltip-icon" aria-hidden="true">i</span>
          <span id="tt-personal" class="tooltip-text" role="tooltip">
            Completa primero información esencial: nombre, cargo, correo y teléfono.
          </span>
        </span>
      </h3>
      <div class="form-row data-fields">
        <label class="label-10" for="name">
          Nombre: <span class="required-indicator" aria-label="requerido">*</span>
        </label>
        <input
          type="text"
          id="name"
          class={`input-35 ${props.errors.name ? 'error' : ''}`}
          placeholder="Ingresa tu Nombre"
          title="Tu nombre completo"
          required
          aria-required="true"
          aria-describedby={props.errors.name ? 'error-name' : undefined}
          value={props.formData.name}
          onInput={(e) => props.onChange('name', e.currentTarget.value)}
        />
        {props.errors.name && <span id="error-name" class="inline-error" role="alert">{props.errors.name}</span>}
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="position">
          Cargo: <span class="required-indicator" aria-label="requerido">*</span>
        </label>
        <input
          type="text"
          id="position"
          class={`input-35 ${props.errors.position ? 'error' : ''}`}
          placeholder="Ingresa puesto o Área"
          title="Tu cargo o área"
          required
          aria-required="true"
          aria-describedby={props.errors.position ? 'error-position' : undefined}
          value={props.formData.position}
          onInput={(e) => props.onChange('position', e.currentTarget.value)}
        />
        {props.errors.position && <span id="error-position" class="inline-error" role="alert">{props.errors.position}</span>}
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="email">Correo:</label>
        <input
          type="email"
          id="email"
          class={`input-35 ${props.errors.email ? 'error' : ''}`}
          placeholder="ejemplo@empresa.com"
          title="Correo electrónico; validación de formato básico"
          aria-describedby={props.errors.email ? 'error-email' : undefined}
          value={props.formData.email}
          onInput={(e) => props.onChange('email', e.currentTarget.value)}
        />
        {props.errors.email && <span id="error-email" class="inline-error" role="alert">{props.errors.email}</span>}
      </div>
      <div class="form-row data-fields">
        <label class="label-10" for="phone">Teléfono:</label>
        <div class="input-group input-35">
          <input
            type="text"
            id="phone"
            class="input-full"
            placeholder="Ej: 3134200"
            title="Teléfono fijo; usa solo dígitos"
            value={props.formData.phone}
            onInput={(e) => props.onChange('phone', e.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  );
}