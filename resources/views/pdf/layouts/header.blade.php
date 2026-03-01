@php
    $settings = \App\Models\Setting::get();
@endphp

<div class="header-corporate">
    <table style="width: 100%; border: none;">
        <tr>
            <td style="width: 50px; vertical-align: middle; border: none; padding: 0;">
                @if($settings->company_logo)
                    <img src="{{ public_path('storage/' . $settings->company_logo) }}"
                         alt="Logo"
                         style="width: 45px; height: auto;">
                @else
                    <div style="width: 45px; height: 45px; border: 2px solid #333; text-align: center; line-height: 45px;">
                        <span style="font-size: 16pt; font-weight: bold;">
                            {{ strtoupper(substr($settings->company_name ?? 'SF', 0, 2)) }}
                        </span>
                    </div>
                @endif
            </td>
            <td style="vertical-align: middle; padding-left: 10px; border: none;">
                <div class="company-name">
                    {{ $settings->company_name ?? 'Sistema de Ferretería' }}
                </div>
                <div class="company-details">
                    @if($settings->company_ruc)
                        RUC: {{ $settings->company_ruc }}
                    @endif
                    @if($settings->company_ruc && $settings->company_address)
                        &nbsp;&bull;&nbsp;
                    @endif
                    @if($settings->company_address)
                        {{ $settings->company_address }}
                    @endif
                    @if(($settings->company_ruc || $settings->company_address) && ($settings->company_phone || $settings->company_email))
                        &nbsp;&bull;&nbsp;
                    @endif
                    @if($settings->company_phone)
                        Tel: {{ $settings->company_phone }}
                    @endif
                    @if($settings->company_phone && $settings->company_email)
                        &nbsp;&bull;&nbsp;
                    @endif
                    @if($settings->company_email)
                        {{ $settings->company_email }}
                    @endif
                </div>
            </td>
        </tr>
    </table>
</div>
