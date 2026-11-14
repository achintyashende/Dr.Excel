package com.drexcel.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

/**
 * Request DTO for C-Extension visual acuity data (Sheet 4).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtensionRequest {

    @Min(value = 0, message = "Value cannot be negative")
    private int preVaLt636;

    @Min(value = 0, message = "Value cannot be negative")
    private int preVa624To636;

    @Min(value = 0, message = "Value cannot be negative")
    private int preVa612To624;

    @Min(value = 0, message = "Value cannot be negative")
    private int preVa66To612;

    @Min(value = 0, message = "Value cannot be negative")
    private int postVaLt636;

    @Min(value = 0, message = "Value cannot be negative")
    private int postVa624To636;

    @Min(value = 0, message = "Value cannot be negative")
    private int postVa612To624;

    @Min(value = 0, message = "Value cannot be negative")
    private int postVa66To612;

    @Min(value = 0, message = "Value cannot be negative")
    private int convVaLt636;

    @Min(value = 0, message = "Value cannot be negative")
    private int convVa624To636;

    @Min(value = 0, message = "Value cannot be negative")
    private int convVa612To624;

    @Min(value = 0, message = "Value cannot be negative")
    private int convVa66To612;
}
