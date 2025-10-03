@php
    $settings = \App\Models\Setting::get();
@endphp

<div class="header-corporate">
    <table style="width: 100%; border: none;">
        <tr>
            <td style="width: 100px; vertical-align: top; border: none;">
                @if($settings->company_logo)
                    <img src="{{ public_path('storage/' . $settings->company_logo) }}"
                         alt="Logo"
                         style="width: 80px; height: auto;">
                @else
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24pt; color: white; font-weight: bold;">
                            {{ substr($settings->company_name ?? 'SF', 0, 2) }}
                        </span>
                    </div>
                @endif
            </td>
            <td style="vertical-align: top; padding-left: 15px; border: none;">
                <div style="color: white;">
                    <div style="font-size: 16pt; font-weight: bold; margin-bottom: 5px;">
                        {{ $settings->company_name ?? 'Sistema de Ferretería' }}
                    </div>
                    <div style="font-size: 8pt; line-height: 1.5;">
                        @if($settings->company_ruc)
                            <strong>RUC:</strong> {{ $settings->company_ruc }}<br>
                        @endif
                        @if($settings->company_address)
                            <strong>Dirección:</strong> {{ $settings->company_address }}<br>
                        @endif
                        @if($settings->company_phone || $settings->company_email)
                            @if($settings->company_phone)
                                <strong>Teléfono:</strong> {{ $settings->company_phone }}
                            @endif
                            @if($settings->company_phone && $settings->company_email)
                                 |
                            @endif
                            @if($settings->company_email)
                                <strong>Email:</strong> {{ $settings->company_email }}
                            @endif
                        @endif
                    </div>
                </div>
            </td>
        </tr>
    </table>
</div>
